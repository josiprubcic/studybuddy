package com.ssz.studybuddy.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCardRequest(@NotBlank @Size(max = 2000) String question,
                                @NotBlank @Size(max = 2000) String answer) {
}
