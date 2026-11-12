package com.ssz.studybuddy.focus;

import java.time.Instant;

public record FocusSessionResponse(Long id, String type, Instant startedAt, int durationSeconds, boolean completed) {
}
