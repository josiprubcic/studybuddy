package com.ssz.studybuddy.document;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Splits a Markdown document into sections ("chunks"): a new chunk starts at every heading,
 * and a section longer than {@link #MAX_CHARS} is split further between paragraphs.
 */
@Component
public class MarkdownChunker {

    static final int MAX_CHARS = 2000;
    private static final Pattern HEADING = Pattern.compile("^#{1,6}\\s+(.+)$");

    public record Section(String heading, String text) {
    }

    public List<Section> split(String markdown) {
        List<Section> sections = new ArrayList<>();
        String heading = null;
        StringBuilder body = new StringBuilder();

        for (String block : markdown.split("\n{2,}")) {
            Matcher m = HEADING.matcher(block.strip());
            if (m.matches()) {
                addSection(sections, heading, body.toString());
                heading = m.group(1).strip();
                body.setLength(0);
            } else {
                if (!body.isEmpty()) body.append("\n\n");
                body.append(block.strip());
            }
        }
        addSection(sections, heading, body.toString());
        return sections;
    }

    // A heading with no text under it (e.g. a chapter title right before a subheading) is dropped.
    private static void addSection(List<Section> sections, String heading, String body) {
        if (body.isBlank()) return;
        StringBuilder part = new StringBuilder();
        for (String paragraph : body.split("\n\n")) {
            if (!part.isEmpty() && part.length() + paragraph.length() + 2 > MAX_CHARS) {
                sections.add(new Section(heading, part.toString()));
                part.setLength(0);
            }
            if (!part.isEmpty()) part.append("\n\n");
            part.append(paragraph); // shortcut: a single paragraph over MAX_CHARS stays whole; split by sentence if that shows up
        }
        sections.add(new Section(heading, part.toString()));
    }
}
