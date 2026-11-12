package com.ssz.studybuddy.document;

import java.time.Instant;

public record DocumentSummary(Long id, String name, String type, Instant createdAt, long chunkCount, long cardCount) {
}
