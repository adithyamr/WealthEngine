package com.wealthengine.agent.service;

import com.wealthengine.common.dto.RecommendationDto;
import com.wealthengine.common.enums.RecommendationAction;
import com.wealthengine.marketdata.service.MarketDataService;
import com.wealthengine.portfolioengine.service.PortfolioService;
import com.wealthengine.sentiment.service.SentimentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * TIER 3: Agentic Analysis Engine.
 *
 * <p>Implements multi-step, tool-augmented reasoning using Spring AI's ChatClient
 * with a full advisor chain:
 *   1. SimpleLoggerAdvisor  – traces every step for auditability
 *   2. QuestionAnswerAdvisor – injects relevant news sentiment from PGVector
 *   3. Tool Calling          – accesses live market data, sentiment, portfolio data
 *
 * <p>Use case: "Should I buy INFY given my current portfolio?"
 * The agent autonomously:
 *   Step 1 → fetchMarketData("INFY")          → gets live price, OHLC
 *   Step 2 → fetchNewsSentiment("INFY")       → gets RAG news sentiment
 *   Step 3 → checkPortfolioConcentration("IT") → checks sector weight
 *   Step 4 → synthesizes recommendation with reasoning trace
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AnalysisAgentService {

    private final ChatClient.Builder chatClientBuilder;
    private final VectorStore vectorStore;
    private final AgentTools agentTools;

    private static final String SYSTEM_PROMPT = """
            You are WealthEngine's Deep-Dive Analyst, a senior financial advisor
            specializing in Indian equities (NSE/BSE).
            
            Your analysis process MUST follow these steps in order:
            1. Fetch the current market data for the ticker
            2. Fetch the latest news sentiment for the ticker
            3. Check how much of the portfolio is already in this sector
            4. Synthesize a final recommendation based on ALL collected data
            
            Output format requirements:
            - Provide a clear BUY/HOLD/SELL/STRONG_BUY/STRONG_SELL action
            - Include a detailed reasoning trace showing your step-by-step analysis
            - Identify 2-3 key risks and 2-3 key strengths
            - Assign a risk level (LOW/MEDIUM/HIGH)
            - Give a confidence score 0.0-1.0
            
            IMPORTANT: Ground all claims in data from the tools. Never fabricate numbers.
            """;

    /**
     * Performs comprehensive multi-step stock analysis with recommendation.
     *
     * @param ticker NSE ticker symbol (e.g., "INFY", "RELIANCE")
     * @param securityId Dhan security ID for the ticker
     * @return Structured recommendation with reasoning trace
     */
    public RecommendationDto analyzeStock(String ticker, String securityId) {
        log.info("Starting analysis agent for ticker={}, securityId={}", ticker, securityId);

        agentTools.setCurrentTicker(ticker);
        agentTools.setCurrentSecurityId(securityId);

        String prompt = String.format("""
                Perform a comprehensive analysis for %s and provide a buy/hold/sell recommendation.
                
                Answer in the following JSON format exactly:
                {
                  "action": "<STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL>",
                  "reasoning": "<detailed multi-step reasoning>",
                  "riskLevel": "<LOW|MEDIUM|HIGH>",
                  "confidenceScore": <0.0-1.0>,
                  "keyRisks": ["<risk1>", "<risk2>"],
                  "keyStrengths": ["<strength1>", "<strength2>"]
                }
                """, ticker);

        String response = chatClientBuilder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultTools(agentTools)
                .defaultAdvisors(
                        new SimpleLoggerAdvisor(),
                        QuestionAnswerAdvisor.builder(vectorStore).build()
                )
                .build()
                .prompt(prompt)
                .call()
                .content();

        return parseAgentResponse(ticker, response);
    }

    private RecommendationDto parseAgentResponse(String ticker, String jsonResponse) {
        String clean = jsonResponse.replaceAll("(?s)```json|```", "").trim();

        String action = extractField(clean, "action", "HOLD");
        String reasoning = extractField(clean, "reasoning", "Analysis unavailable.");
        String riskLevel = extractField(clean, "riskLevel", "MEDIUM");
        double confidence = extractDouble(clean, "confidenceScore", 0.5);

        RecommendationAction recommendationAction;
        try {
            recommendationAction = RecommendationAction.valueOf(action.toUpperCase());
        } catch (IllegalArgumentException e) {
            recommendationAction = RecommendationAction.HOLD;
        }

        return RecommendationDto.builder()
                .ticker(ticker)
                .action(recommendationAction)
                .reasoning(reasoning)
                .riskLevel(riskLevel)
                .confidenceScore(confidence)
                .generatedAt(Instant.now())
                .build();
    }

    private String extractField(String json, String key, String defaultVal) {
        try {
            int idx = json.indexOf("\"" + key + "\"");
            if (idx < 0) return defaultVal;
            int colon = json.indexOf(":", idx) + 1;
            String rest = json.substring(colon).trim();
            if (rest.startsWith("\"")) {
                int end = rest.indexOf("\"", 1);
                return end > 0 ? rest.substring(1, end) : defaultVal;
            }
            return defaultVal;
        } catch (Exception e) { return defaultVal; }
    }

    private double extractDouble(String json, String key, double defaultVal) {
        try {
            int idx = json.indexOf("\"" + key + "\"");
            if (idx < 0) return defaultVal;
            int colon = json.indexOf(":", idx) + 1;
            String rest = json.substring(colon).trim();
            int end = rest.indexOf(",");
            if (end < 0) end = rest.indexOf("}");
            return Double.parseDouble(rest.substring(0, end).trim());
        } catch (Exception e) { return defaultVal; }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Inner Tools Component (mutable per-request context)
    // ─────────────────────────────────────────────────────────────────────────

    @Component
    @RequiredArgsConstructor
    public static class AgentTools {

        private final MarketDataService marketDataService;
        private final SentimentService sentimentService;
        private final PortfolioService portfolioService;

        private volatile String currentTicker;
        private volatile String currentSecurityId;

        public void setCurrentTicker(String ticker) { this.currentTicker = ticker; }
        public void setCurrentSecurityId(String id) { this.currentSecurityId = id; }

        @Tool(description = "Fetches live market data (LTP, OHLC, volume, change%) for the stock being analyzed. " +
                "Call this FIRST in every analysis.")
        public String fetchMarketData() {
            try {
                var tick = marketDataService.getTick(
                        com.wealthengine.common.enums.ExchangeSegment.NSE_EQ,
                        currentSecurityId);
                return String.format("""
                        Market Data for %s:
                          LTP:    ₹%s
                          Open:   ₹%s  High: ₹%s  Low: ₹%s
                          Change: %s%% (%s)
                          Volume: %s
                        """,
                        currentTicker,
                        tick.getLastTradedPrice(),
                        tick.getOpenPrice(), tick.getHighPrice(), tick.getLowPrice(),
                        tick.getChangePercent(), tick.getChangeAbsolute(),
                        tick.getVolume());
            } catch (Exception e) {
                return "Market data unavailable for " + currentTicker + ": " + e.getMessage();
            }
        }

        @Tool(description = "Fetches latest news sentiment analysis for the stock using RAG over recent financial news. " +
                "Call this SECOND to understand market sentiment.")
        public String fetchNewsSentiment() {
            try {
                var sentiment = sentimentService.getSentiment(currentTicker);
                return String.format("""
                        News Sentiment for %s:
                          Overall: %s (score: %.2f)
                          Summary: %s
                        """,
                        currentTicker, sentiment.getSentiment(),
                        sentiment.getSentimentScore(), sentiment.getSummary());
            } catch (Exception e) {
                return "Sentiment data unavailable for " + currentTicker + ": " + e.getMessage();
            }
        }

        @Tool(description = "Checks the current portfolio concentration for a sector to determine if adding this stock would over-concentrate the portfolio. " +
                "Pass the sector name (e.g. IT, Banking, Pharma). Call this THIRD.")
        public String checkPortfolioConcentration(String sector) {
            try {
                Map<String, BigDecimal> concentration = portfolioService.getSectorConcentration("current-user");
                BigDecimal sectorWeight = concentration.getOrDefault(sector, BigDecimal.ZERO);
                return String.format("""
                        Portfolio Sector Exposure:
                          Current %s weight: %.1f%%
                          %s
                        """,
                        sector, sectorWeight.multiply(BigDecimal.valueOf(100)),
                        sectorWeight.compareTo(BigDecimal.valueOf(0.25)) > 0
                                ? "⚠️ WARNING: Already over-concentrated in " + sector + " (>25%)"
                                : "✅ Sector weight is within safe limits");
            } catch (Exception e) {
                return "Portfolio concentration check failed: " + e.getMessage();
            }
        }
    }
}
