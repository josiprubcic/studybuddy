package com.ssz.studybuddy.document;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MarkdownChunkerTest {

    private final MarkdownChunker chunker = new MarkdownChunker();

    @Test
    void startsANewChunkAtEveryHeadingAndDropsEmptyOnes() {
        String md = """
                Intro text before any heading.

                # Cell biology

                ## Mitochondria

                Mitochondria produce ATP.

                - Outer membrane
                - Inner membrane

                ## Ribosomes

                Ribosomes make proteins.
                """;

        List<MarkdownChunker.Section> sections = chunker.split(md);

        assertEquals(3, sections.size(), sections.toString());
        assertNull(sections.get(0).heading());
        assertEquals("Intro text before any heading.", sections.get(0).text());
        assertEquals("Mitochondria", sections.get(1).heading());
        assertEquals("Mitochondria produce ATP.\n\n- Outer membrane\n- Inner membrane", sections.get(1).text());
        assertEquals("Ribosomes", sections.get(2).heading());
    }

    @Test
    void splitsLongSectionsBetweenParagraphsAndKeepsTheHeading() {
        String paragraph = "x".repeat(900);
        String md = "## Long\n\n" + paragraph + "\n\n" + paragraph + "\n\n" + paragraph + "\n";

        List<MarkdownChunker.Section> sections = chunker.split(md);

        assertEquals(2, sections.size());
        assertTrue(sections.stream().allMatch(s -> "Long".equals(s.heading())));
        assertTrue(sections.stream().allMatch(s -> s.text().length() <= MarkdownChunker.MAX_CHARS));
        assertEquals(paragraph + "\n\n" + paragraph, sections.get(0).text());
    }

    @Test
    void emptyMarkdownGivesNoChunks() {
        assertTrue(chunker.split("").isEmpty());
    }
}
