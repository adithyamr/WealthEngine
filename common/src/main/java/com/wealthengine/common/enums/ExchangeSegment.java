package com.wealthengine.common.enums;

/**
 * Exchange segments supported by Dhan and AngelOne APIs.
 */
public enum ExchangeSegment {
    NSE_EQ("NSE_EQ", "NSE Equity"),
    NSE_FNO("NSE_FNO", "NSE Futures & Options"),
    NSE_CURRENCY("NSE_CUR", "NSE Currency"),
    BSE_EQ("BSE_EQ", "BSE Equity"),
    BSE_FNO("BSE_FNO", "BSE Futures & Options"),
    MCX_COMM("MCX_COMM", "MCX Commodity");

    private final String code;
    private final String displayName;

    ExchangeSegment(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }
}
