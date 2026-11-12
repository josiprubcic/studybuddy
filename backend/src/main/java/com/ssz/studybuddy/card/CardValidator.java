package com.ssz.studybuddy.card;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Keeps only AI cards a student can trust: verbatim quote, well-formed blanks, no duplicates. */
final class CardValidator {

    static final int MAX_PER_CHUNK = 10;
    static final String BLANK = "____";

    private CardValidator() {
    }

    static List<GeneratedCard> validate(List<GeneratedCard> candidates, String chunkText) {
        String text = collapse(chunkText);
        Set<String> seen = new HashSet<>();
        List<GeneratedCard> kept = new ArrayList<>();
        for (GeneratedCard c : candidates) {
            if (kept.size() >= MAX_PER_CHUNK) {
                break;
            }
            if (c == null || c.type() == null || c.question() == null || c.answer() == null || c.quote() == null) {
                continue;
            }
            String question = c.question().strip();
            String answer = c.answer().strip();
            String quote = c.quote().strip();
            boolean fillIn = c.type().equals("fill_in");
            if (!fillIn && !c.type().equals("flashcard")) {
                continue;
            }
            if (question.isEmpty() || answer.isEmpty() || quote.isEmpty() || !text.contains(collapse(quote))) {
                continue;
            }
            if (fillIn && (!question.contains(BLANK)
                    || !quote.toLowerCase(Locale.ROOT).contains(answer.toLowerCase(Locale.ROOT)))) {
                continue;
            }
            if (seen.add(question.toLowerCase(Locale.ROOT))) {
                kept.add(new GeneratedCard(c.type(), question, answer, quote));
            }
        }
        return kept;
    }

    private static String collapse(String s) {
        return s.replaceAll("\\s+", " ").strip();
    }
}
