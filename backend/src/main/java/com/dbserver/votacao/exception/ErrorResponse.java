package com.dbserver.votacao.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> campos
) {
    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(LocalDateTime.now(), status, error, message, null);
    }

    public static ErrorResponse ofValidation(int status, Map<String, String> campos) {
        return new ErrorResponse(LocalDateTime.now(), status, "Validation Error",
                "Um ou mais campos estão inválidos.", campos);
    }
}