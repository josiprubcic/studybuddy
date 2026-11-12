package com.ssz.studybuddy.card;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OpenAiCardGenerator implements CardGenerator {

    static final String SYSTEM_PROMPT = """
            You create study cards from one section of a student's document.
            Generate 3 to 6 flashcards and 2 to 4 fill-in-the-blanks, using ONLY the given text.
            Never add facts that are not in the text.
            Write questions and answers in the same language as the text (Croatian or English).
            Every card has a "quote": exactly one sentence copied character-for-character from the text.
            Card types, exactly "flashcard" or "fill_in":
            - flashcard: "question" is a question, "answer" is its answer.
            - fill_in: "question" is the quoted sentence with exactly one key term replaced by "____",
              "answer" is the removed term.
            """;

    record GeneratedCards(List<GeneratedCard> cards) {
    }

    private final ChatClient client;

    public OpenAiCardGenerator(ChatClient.Builder builder) {
        this.client = builder.build();
    }

    @Override
    public List<GeneratedCard> generate(String heading, String chunkText) {
        String user = (heading == null ? "" : "Section: " + heading + "\n\n") + "Text:\n" + chunkText;
        GeneratedCards result = client.prompt().system(SYSTEM_PROMPT).user(user).call().entity(GeneratedCards.class);
        return result == null || result.cards() == null ? List.of() : result.cards();
    }
}
