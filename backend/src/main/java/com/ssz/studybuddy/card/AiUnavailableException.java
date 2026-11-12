package com.ssz.studybuddy.card;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class AiUnavailableException extends ErrorResponseException {

    public AiUnavailableException(Throwable cause) {
        super(HttpStatus.SERVICE_UNAVAILABLE, problem(), cause);
    }

    private static ProblemDetail problem() {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE,
                "Card generation is temporarily unavailable. Try again later.");
        p.setTitle("AI unavailable");
        p.setProperty("code", "AI_UNAVAILABLE");
        return p;
    }
}
