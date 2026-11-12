package com.ssz.studybuddy.card;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class CardNotFoundException extends ErrorResponseException {

    public CardNotFoundException(Long id) {
        super(HttpStatus.NOT_FOUND, problem(id), null);
    }

    private static ProblemDetail problem(Long id) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Card " + id + " not found");
        p.setTitle("Card not found");
        p.setProperty("code", "CARD_NOT_FOUND");
        return p;
    }
}
