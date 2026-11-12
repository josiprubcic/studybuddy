package com.ssz.studybuddy.document;

/** The uploaded file can't be used: not a PDF, damaged, or without a text layer. The message is shown to the user. */
public class InvalidDocumentException extends RuntimeException {

    public InvalidDocumentException(String message) {
        super(message);
    }
}
