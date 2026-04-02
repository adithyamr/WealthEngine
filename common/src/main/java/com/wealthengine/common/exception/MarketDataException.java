package com.wealthengine.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class MarketDataException extends WealthEngineException {
    public MarketDataException(String message) {
        super(message, "MARKET_DATA_ERROR");
    }

    public MarketDataException(String message, Throwable cause) {
        super(message, cause);
    }
}
