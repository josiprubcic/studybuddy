package com.ssz.studybuddy.document;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class PdfToMarkdownConverterTest {

    private final PdfToMarkdownConverter converter = new PdfToMarkdownConverter();

    @Test
    void convertsHeadingsParagraphsAndBullets() throws IOException {
        String md = converter.convert(samplePdf());
        System.out.println(md);

        assertTrue(md.startsWith("# Cell biology\n"), md);
        assertTrue(md.contains("\n## Mitochondria\n"), md);
        assertTrue(md.contains("Mitochondria produce most of the cell's ATP through cellular respiration."), md);
        assertTrue(md.contains("They have two membranes:\n\n- Outer membrane\n- Inner membrane\n\n"), md);
        assertTrue(md.contains("folded into cristae, which increases its surface."), md);
        assertFalse(md.contains("\n1\n"), "page number should be dropped: " + md);
        assertTrue(md.contains("The Treaty of Brest-Litovsk ended the war"), "compound kept with its hyphen: " + md);
    }

    @Test
    void scannedPdfWithoutTextGivesEmptyMarkdown() throws IOException {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            doc.addPage(new PDPage());
            doc.save(out);
            assertEquals("", converter.convert(out.toByteArray()).strip());
        }
    }

    private static byte[] samplePdf() throws IOException {
        var regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        var bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = 720;
                y = line(cs, bold, 22, "Cell biology", y, 40);
                y = line(cs, bold, 15, "Mitochondria", y, 30);
                // 3 pt gap = normal line spacing inside a paragraph, 16 pt = paragraph break
                y = line(cs, regular, 11, "Mitochondria produce most of the cell's ATP through cel-", y, 3);
                y = line(cs, regular, 11, "lular respiration.", y, 16);
                y = line(cs, regular, 11, "They have two membranes:", y, 3);
                y = line(cs, regular, 11, "• Outer membrane", y, 3);
                y = line(cs, regular, 11, "• Inner membrane", y, 16);
                y = line(cs, regular, 11, "The inner membrane is folded into cristae, which increases", y, 3);
                y = line(cs, regular, 11, "its surface.", y, 16);
                y = line(cs, regular, 11, "The Treaty of Brest-", y, 3);
                y = line(cs, regular, 11, "Litovsk ended the war in the east.", y, 3);
                line(cs, regular, 9, "1", 60, 0);
            }
            doc.save(out);
            return out.toByteArray();
        }
    }

    private static float line(PDPageContentStream cs, PDType1Font font, float size, String text, float y, float gapAfter)
            throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(72, y);
        cs.showText(text);
        cs.endText();
        return y - size - gapAfter;
    }
}
