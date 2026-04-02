package com.wealthengine.common.enums;

/**
 * Represents all supported asset types in the WealthEngine portfolio.
 */
public enum AssetType {
    STOCK("Equity - Direct Stocks"),
    MUTUAL_FUND("Mutual Fund"),
    ETF("Exchange Traded Fund"),
    PPF("Public Provident Fund"),
    FD("Fixed Deposit"),
    NPS("National Pension System"),
    EPF("Employee Provident Fund"),
    BONDS("Government / Corporate Bonds"),
    GOLD("Gold / Sovereign Gold Bond"),
    REAL_ESTATE("Real Estate"),
    CRYPTO("Cryptocurrency"),
    CASH("Cash / Savings Account");

    private final String displayName;

    AssetType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
