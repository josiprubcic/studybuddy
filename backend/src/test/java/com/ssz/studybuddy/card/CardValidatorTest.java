package com.ssz.studybuddy.card;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CardValidatorTest {

    static final String TEXT = "Mitochondria produce ATP.\nRibosomes make   proteins.";

    private static GeneratedCard card(String type, String q, String a, String quote) {
        return new GeneratedCard(type, q, a, quote);
    }

    private static List<GeneratedCard> validate(GeneratedCard... cs) {
        return CardValidator.validate(List.of(cs), TEXT);
    }

    @Test
    void keepsValidFlashcardAndFillIn() {
        var kept = validate(
                card("flashcard", " What do mitochondria produce? ", "ATP", "Mitochondria produce ATP."),
                card("fill_in", "Ribosomes make ____.", "Proteins", "Ribosomes make proteins."));
        assertThat(kept).hasSize(2);
        assertThat(kept.get(0).question()).isEqualTo("What do mitochondria produce?");
    }

    @Test
    void dropsInvalidCards() {
        assertThat(validate(
                card("flashcard", "Q?", "A", "Not in the text."),
                card("fill_in", "Mitochondria produce ATP.", "ATP", "Mitochondria produce ATP."),
                card("fill_in", "Mitochondria produce ____.", "water", "Mitochondria produce ATP."),
                card("flashcard", " ", "A", "Mitochondria produce ATP."),
                card("flashcard", "Q?", "", "Mitochondria produce ATP."),
                card("flashcard", "Q?", "A", " "),
                card("essay", "Q?", "A", "Mitochondria produce ATP."))).isEmpty();
    }

    @Test
    void dropsDuplicateQuestionsIgnoringCase() {
        assertThat(validate(
                card("flashcard", "What?", "ATP", "Mitochondria produce ATP."),
                card("flashcard", "WHAT?", "ATP", "Mitochondria produce ATP."))).hasSize(1);
    }

    @Test
    void capsAtTen() {
        List<GeneratedCard> many = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            many.add(card("flashcard", "Q" + i + "?", "ATP", "Mitochondria produce ATP."));
        }
        assertThat(CardValidator.validate(many, TEXT)).hasSize(10);
    }
}
