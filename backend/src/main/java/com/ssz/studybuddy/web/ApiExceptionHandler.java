package com.ssz.studybuddy.web;

import com.ssz.studybuddy.document.DocumentNotFoundException;
import com.ssz.studybuddy.document.InvalidDocumentException;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns errors into RFC 9457 problem details (application/problem+json). Every problem carries a stable
 * {@code code} property; the frontend shows a translated message for it, never the English {@code detail}.
 * Feature-specific errors can also extend ErrorResponseException and set their own "code" property.
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(InvalidDocumentException.class)
    ProblemDetail invalidDocument(InvalidDocumentException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Invalid document");
        pd.setProperty("code", ex.getCode());
        return pd;
    }

    @ExceptionHandler(DocumentNotFoundException.class)
    ProblemDetail documentNotFound(DocumentNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Document not found");
        pd.setProperty("code", "DOCUMENT_NOT_FOUND");
        return pd;
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return withCode(super.handleMaxUploadSizeExceededException(ex, headers, status, request), "FILE_TOO_LARGE");
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return withCode(super.handleMethodArgumentNotValid(ex, headers, status, request), "VALIDATION_FAILED");
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return withCode(super.handleHandlerMethodValidationException(ex, headers, status, request), "VALIDATION_FAILED");
    }

    private static @Nullable ResponseEntity<Object> withCode(@Nullable ResponseEntity<Object> response, String code) {
        if (response != null && response.getBody() instanceof ProblemDetail pd) {
            pd.setProperty("code", code);
        }
        return response;
    }
}
