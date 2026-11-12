package com.ssz.studybuddy.focus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

public record CreateFocusSessionRequest(@NotNull @Pattern(regexp = "focus|break") String type,
                                        @NotNull Instant startedAt,
                                        @NotNull @Min(1) @Max(7200) Integer durationSeconds,
                                        @NotNull Boolean completed) {
}
