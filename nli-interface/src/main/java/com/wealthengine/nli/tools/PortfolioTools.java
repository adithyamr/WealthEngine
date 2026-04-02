package com.wealthengine.nli.tools;

import com.wealthengine.common.dto.*;
import com.wealthengine.common.enums.AssetType;
import com.wealthengine.portfolioengine.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Spring AI Tool Calling definitions for the NLI (Natural Language Interface).
 *
 * <p>These @Tool-annotated methods are discovered by Spring AI and passed to the
 * LLM as callable functions. The LLM decides when to invoke them based on the
 * user's natural language query.
 *
 * <p>Example queries → tool mappings:
 * - "What is my total net worth?" → getTotalNetWorth()
 * - "Show me my mutual fund holdings" → getHoldingsByType("MUTUAL_FUND")
 * - "Which sectors am I heavy in?" → getSectorConcentration()
 * - "What's my overall portfolio XIRR?" → getPortfolioXirr()
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PortfolioTools {

    private final PortfolioService portfolioService;

    // Hard-coded to "current-user" for MVP; replace with SecurityContext in production
    private static final String DEFAULT_USER = "current-user";

    @Tool(description = "Returns the total current net worth of the user's portfolio in INR (Indian Rupees). " +
            "Use this when the user asks about their total wealth, net worth, or total portfolio value.")
    public String getTotalNetWorth() {
        BigDecimal netWorth = portfolioService.getTotalNetWorth(DEFAULT_USER);
        return "Total Net Worth: ₹" + netWorth.toPlainString();
    }

    @Tool(description = "Returns holdings for a specific asset type. " +
            "assetType must be one of: STOCK, MUTUAL_FUND, ETF, PPF, FD, NPS, EPF, BONDS, GOLD, CRYPTO, CASH. " +
            "Use when user asks about a specific investment category like stocks, mutual funds, PPF etc.")
    public String getHoldingsByType(String assetType) {
        try {
            AssetType type = AssetType.valueOf(assetType.toUpperCase());
            List<AssetDto> holdings = portfolioService.getHoldingsByType(DEFAULT_USER, type);
            if (holdings.isEmpty()) {
                return "No " + type.getDisplayName() + " holdings found.";
            }
            StringBuilder sb = new StringBuilder(type.getDisplayName() + " Holdings:\n");
            holdings.forEach(h -> sb.append(String.format("  - %s (%s): ₹%.2f (%.2f%%)\n",
                    h.getName(), h.getSymbol() != null ? h.getSymbol() : "N/A",
                    h.getCurrentValue(), h.getGainLossPercent())));
            return sb.toString();
        } catch (IllegalArgumentException e) {
            return "Unknown asset type: " + assetType + ". Please use: STOCK, MUTUAL_FUND, ETF, PPF, FD, NPS, EPF";
        }
    }

    @Tool(description = "Returns the portfolio sector concentration for equity holdings as percentages. " +
            "Use when user asks about sector exposure, sector diversification, or which sectors they are invested in.")
    public String getSectorConcentration() {
        Map<String, BigDecimal> sectors = portfolioService.getSectorConcentration(DEFAULT_USER);
        if (sectors.isEmpty()) return "No equity sector data available.";
        StringBuilder sb = new StringBuilder("Sector Concentration (Equity):\n");
        sectors.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .forEach(e -> sb.append(String.format("  - %s: %.1f%%\n",
                        e.getKey(), e.getValue().multiply(BigDecimal.valueOf(100)))));
        return sb.toString();
    }

    @Tool(description = "Returns the annualized XIRR (Extended Internal Rate of Return) for the entire portfolio. " +
            "Use when user asks about portfolio returns, IRR, CAGR, or overall performance.")
    public String getPortfolioXirr() {
        try {
            double xirr = portfolioService.getPortfolioXirr(DEFAULT_USER);
            return String.format("Portfolio XIRR: %.2f%% per annum", xirr * 100);
        } catch (Exception e) {
            return "Unable to calculate XIRR: " + e.getMessage();
        }
    }

    @Tool(description = "Returns a full portfolio summary with net worth, allocation by asset type, gain/loss, and XIRR. " +
            "Use for comprehensive portfolio overview requests.")
    public String getPortfolioSummary() {
        PortfolioSummaryDto summary = portfolioService.getPortfolioSummary(DEFAULT_USER);
        return String.format("""
                Portfolio Summary:
                  Net Worth:    ₹%s
                  Invested:     ₹%s
                  Gain/Loss:    ₹%s (%.2f%%)
                  XIRR:         %.2f%% p.a.
                  Top Sectors:  %s
                """,
                summary.getTotalNetWorth().toPlainString(),
                summary.getTotalInvested().toPlainString(),
                summary.getTotalGainLoss().toPlainString(),
                summary.getTotalGainLossPercent().doubleValue(),
                summary.getXirrPercent().doubleValue(),
                summary.getAllocationBySector().keySet().stream().limit(3).toList());
    }
}
