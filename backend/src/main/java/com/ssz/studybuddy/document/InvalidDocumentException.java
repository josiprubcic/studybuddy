package com.ssz.studybuddy.document;

/**
 * The uploaded file can't be used. {@link #getCode()} is a stable machine code the frontend translates;
 * the message is an English fallback for API clients and logs.
 */
public class InvalidDocumentException extends RuntimeException {

    private final String code;

    public InvalidDocumentException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
