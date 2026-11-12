package com.ssz.studybuddy.document;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;

/**
 * Turns a text PDF into simple Markdown: larger fonts become headings, bullet lines become lists,
 * lines of one paragraph are joined. Scanned PDFs yield an empty string (no text layer).
 */
// shortcut: font-size heuristic, no tables or formulas; swap for an OCR model behind this class if pilot quality is poor
@Component
public class PdfToMarkdownConverter {

    private static final int MAX_HEADING_LEVELS = 3;
    private static final int MAX_HEADING_CHARS = 120; // a longer line in a big font is body text, not a heading
    private static final String BULLETS = "•▪◦●○■□–-*";

    public String convert(byte[] pdf) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdf)) {
            LineCollector collector = new LineCollector();
            collector.setSortByPosition(true);
            collector.getText(document);
            return toMarkdown(collector.lines);
        }
    }

    record Line(String text, float fontSize) {
        static final Line PARAGRAPH_BREAK = new Line("", 0);
    }

    /** Collects each text line with its largest font size; paragraph breaks become empty lines. */
    static class LineCollector extends PDFTextStripper {
        final List<Line> lines = new ArrayList<>();
        private final StringBuilder current = new StringBuilder();
        private float maxFontSize;

        LineCollector() throws IOException {
        }

        @Override
        protected void writeString(String text, List<TextPosition> positions) {
            current.append(text);
            for (TextPosition p : positions) {
                maxFontSize = Math.max(maxFontSize, p.getFontSizeInPt());
            }
        }

        @Override
        protected void writeWordSeparator() {
            current.append(' ');
        }

        @Override
        protected void writeLineSeparator() {
            flushLine();
        }

        @Override
        protected void writeParagraphEnd() {
            flushLine();
            lines.add(Line.PARAGRAPH_BREAK);
        }

        @Override
        protected void writePageEnd() {
            flushLine();
            lines.add(Line.PARAGRAPH_BREAK);
        }

        private void flushLine() {
            String text = current.toString().strip();
            if (!text.isEmpty()) {
                lines.add(new Line(text, maxFontSize));
            }
            current.setLength(0);
            maxFontSize = 0;
        }
    }

    static String toMarkdown(List<Line> lines) {
        float bodySize = mostCommonFontSize(lines);
        Map<Float, Integer> headingLevels = headingLevels(lines, bodySize);

        StringBuilder md = new StringBuilder();
        StringBuilder paragraph = new StringBuilder();
        boolean inList = false;

        for (Line line : lines) {
            String text = line.text();
            if (line == Line.PARAGRAPH_BREAK || isPageNumber(text)) {
                flushParagraph(md, paragraph);
                continue;
            }
            boolean bullet = isBullet(text);
            if (inList && !bullet) {
                md.append('\n'); // blank line closes the list
                inList = false;
            }
            Integer level = text.length() <= MAX_HEADING_CHARS ? headingLevels.get(round(line.fontSize())) : null;
            if (level != null) {
                flushParagraph(md, paragraph);
                md.append("#".repeat(level)).append(' ').append(text).append("\n\n");
            } else if (bullet) {
                flushParagraph(md, paragraph);
                md.append("- ").append(text.substring(1).strip()).append('\n');
                inList = true;
            } else if (paragraph.length() > 0 && paragraph.charAt(paragraph.length() - 1) == '-'
                    && Character.isLowerCase(text.charAt(0))) {
                paragraph.setLength(paragraph.length() - 1); // re-join a word hyphenated across lines
                paragraph.append(text);
            } else {
                if (paragraph.length() > 0) paragraph.append(' ');
                paragraph.append(text);
            }
        }
        flushParagraph(md, paragraph);
        return md.toString().replaceAll("\n{3,}", "\n\n").strip() + "\n";
    }

    private static void flushParagraph(StringBuilder md, StringBuilder paragraph) {
        if (paragraph.length() > 0) {
            md.append(paragraph).append("\n\n");
            paragraph.setLength(0);
        }
    }

    /** Body text size = the font size covering the most characters. */
    private static float mostCommonFontSize(List<Line> lines) {
        Map<Float, Integer> charsPerSize = new HashMap<>();
        for (Line line : lines) {
            if (line != Line.PARAGRAPH_BREAK) {
                charsPerSize.merge(round(line.fontSize()), line.text().length(), Integer::sum);
            }
        }
        return charsPerSize.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(0f);
    }

    /** Sizes clearly above body text map to #, ##, ### (largest first). */
    private static Map<Float, Integer> headingLevels(List<Line> lines, float bodySize) {
        List<Float> sizes = lines.stream()
                .filter(l -> l != Line.PARAGRAPH_BREAK && l.text().length() <= MAX_HEADING_CHARS)
                .map(l -> round(l.fontSize()))
                .filter(size -> size > bodySize * 1.15f)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .limit(MAX_HEADING_LEVELS)
                .toList();
        Map<Float, Integer> levels = new HashMap<>();
        for (int i = 0; i < sizes.size(); i++) {
            levels.put(sizes.get(i), i + 1);
        }
        return levels;
    }

    private static boolean isBullet(String text) {
        return text.length() > 1 && BULLETS.indexOf(text.charAt(0)) >= 0 && Character.isWhitespace(text.charAt(1));
    }

    private static boolean isPageNumber(String text) {
        return text.matches("\\d{1,4}");
    }

    private static float round(float size) {
        return Math.round(size * 2) / 2f; // half-point buckets absorb tiny size jitter
    }
}
