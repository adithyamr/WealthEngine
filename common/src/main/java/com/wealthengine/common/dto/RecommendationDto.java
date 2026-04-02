package com.wealthengine.common.dto;

import com.wealthengine.common.enums.RecommendationAction;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

/**
 * AI recommendation DTO from the analysis-agent module.
 */
@Data
@Builder
public class RecommendationDto {
    private String ticker;
    private String companyName;
    private RecommendationAction action;
    private String reasoning; // Detailed multi-step reasoning trace
    private String riskLevel; // LOW / MEDIUM / HIGH
    private Double confidenceScore; // 0.0 - 1.0
    private String sentimentSummary; // News sentiment context
    private String portfolioConcentration; // Current portfolio weight
    private List<String> keyRisks;
    private List<String> keyStrengths;
    private Instant generatedAt;
}
