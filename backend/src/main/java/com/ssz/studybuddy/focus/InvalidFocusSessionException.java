package com.ssz.studybuddy.focus;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class InvalidFocusSessionException extends ErrorResponseException {

    public InvalidFocusSessionException(String detail) {
        super(HttpStatus.BAD_REQUEST, problem(detail), null);
    }

    private static ProblemDetail problem(String detail) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
        p.setTitle("Invalid focus session request");
        p.setProperty("code", "VALIDATION_FAILED");
        return p;
    }
}
