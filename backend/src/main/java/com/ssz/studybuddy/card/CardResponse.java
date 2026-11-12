package com.ssz.studybuddy.card;

public record CardResponse(Long id, Long chunkId, int chunkPosition, String chunkHeading, String type,
                           String question, String answer, String quote) {
}
