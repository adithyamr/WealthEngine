package com.wealthengine.common.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Sentiment analysis result from the RAG pipeline.
 */
@Data
@Builder
public class SentimentResultDto {
    private String ticker;
    private String sentiment; // POSITIVE / NEGATIVE / NEUTRAL / MIXED
    private double sentimentScore; // -1.0 (very negative) to 1.0 (very positive)
    private String summary; // AI-generated summary of market sentiment
    private int articleCount; // Number of news articles analyzed
}
