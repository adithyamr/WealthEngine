package com.wealthengine.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Base exception for all WealthEngine business errors.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class WealthEngineException extends RuntimeException {
    private final String errorCode;

    public WealthEngineException(String message) {
        super(message);
        this.errorCode = "WEALTH_ENGINE_ERROR";
    }

    public WealthEngineException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public WealthEngineException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "WEALTH_ENGINE_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }
}
