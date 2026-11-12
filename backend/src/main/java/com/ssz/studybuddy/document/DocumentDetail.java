package com.ssz.studybuddy.document;

import java.time.Instant;
import java.util.List;

public record DocumentDetail(Long id, String name, String type, Instant createdAt, String markdown,
                             List<ChunkResponse> chunks) {

    public record ChunkResponse(Long id, int position, String heading, String text) {
    }
}
