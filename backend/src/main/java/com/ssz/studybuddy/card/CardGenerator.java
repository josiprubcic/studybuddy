package com.ssz.studybuddy.card;

import java.util.List;

public interface CardGenerator {

    /** Makes card candidates for one chunk. May throw on AI failure; the output must still be validated. */
    List<GeneratedCard> generate(String heading, String chunkText);
}
