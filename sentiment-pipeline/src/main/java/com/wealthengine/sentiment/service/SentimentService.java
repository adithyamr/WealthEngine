package com.wealthengine.sentiment.service;

import com.wealthengine.common.dto.SentimentResultDto;
import com.wealthengine.sentiment.scraper.NewsScraperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * TIER 2: LLM-Augmented Sentiment Analysis.
 *
 * <p>Ingests financial news into PGVector and uses RAG (QuestionAnswerAdvisor)
 * to answer sentiment queries about specific stock tickers.
 *
 * <p>Daily pipeline:
 * 1. Scrape news from MoneyControl + Economic Times RSS at 08:00 IST
 * 2. Embed each article using OpenAI text-embedding-3-small
 * 3. Upsert into PGVector with metadata {ticker, source, date}
 *
 * <p>Query pipeline:
 * 1. ChatClient with QuestionAnswerAdvisor retrieves top-K similar news chunks
 * 2. LLM synthesizes a sentiment answer with score and summary
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SentimentService {

    private final VectorStore vectorStore;
    private final ChatClient.Builder chatClientBuilder;
    private final NewsScraperService newsScraperService;

    /**
     * Analyzes market sentiment for a given NSE ticker.
     * Uses RAG: retrieves relevant news from PGVector and asks the LLM to synthesize.
     */
    public SentimentResultDto getSentiment(String ticker) {
        log.info("Analyzing sentiment for ticker={}", ticker);

        ChatClient chatClient = chatClientBuilder
                .defaultAdvisors(
                        QuestionAnswerAdvisor.builder(vectorStore)
                                .build()
                )
                .build();

        String prompt = String.format("""
                Based on recent financial news about %s (NSE India), answer the following:
                1. What is the overall market sentiment? (POSITIVE/NEGATIVE/NEUTRAL/MIXED)
                2. What is a sentiment score between -1.0 (very negative) and 1.0 (very positive)?
                3. In 2-3 sentences, summarize the key factors driving this sentiment.
                
                Respond in JSON format:
                {
                  "sentiment": "POSITIVE|NEGATIVE|NEUTRAL|MIXED",
                  "sentimentScore": <float between -1 and 1>,
                  "summary": "<2-3 sentence summary>"
                }
                """, ticker);

        String response = chatClient
                .prompt(prompt)
                .call()
                .content();

        return parseSentimentResponse(ticker, response);
    }

    /**
     * Daily scheduled pipeline: scrape news for all major Indian stocks
     * and ingest into PGVector for RAG retrieval.
     *
     * Runs at 08:00 IST every weekday (before market open at 09:15 IST).
     */
    @Scheduled(cron = "0 0 8 * * MON-FRI", zone = "Asia/Kolkata")
    public void ingestDailyNews() {
        log.info("Starting daily news ingestion pipeline...");
        try {
            List<NewsScraperService.NewsArticle> articles = newsScraperService.fetchAllMarketNews();
            List<Document> documents = articles.stream()
                    .map(article -> {
                        Document doc = new Document(article.toEmbeddingText());
                        doc.getMetadata().put("source", article.source());
                        doc.getMetadata().put("publishedDate", article.publishedDate());
                        doc.getMetadata().put("url", article.url());
                        if (article.ticker() != null) {
                            doc.getMetadata().put("ticker", article.ticker());
                        }
                        return doc;
                    })
                    .toList();

            vectorStore.add(documents);
            log.info("Ingested {} news articles into PGVector", documents.size());
        } catch (Exception e) {
            log.error("Failed to ingest daily news: {}", e.getMessage(), e);
        }
    }

    /**
     * Manually trigger news ingestion for a specific ticker.
     * Useful for on-demand refreshes before analysis.
     */
    public void ingestNewsForTicker(String ticker) {
        List<NewsScraperService.NewsArticle> articles = newsScraperService.fetchNewsForTicker(ticker);
        List<Document> documents = articles.stream()
                .map(article -> {
                    Document doc = new Document(article.toEmbeddingText());
                    doc.getMetadata().putAll(Map.of(
                            "ticker", ticker,
                            "source", article.source(),
                            "publishedDate", article.publishedDate()
                    ));
                    return doc;
                })
                .toList();
        vectorStore.add(documents);
        log.info("Ingested {} articles for ticker={}", documents.size(), ticker);
    }

    private SentimentResultDto parseSentimentResponse(String ticker, String jsonResponse) {
        // Extract JSON fields from LLM response (handles markdown code blocks)
        String cleanJson = jsonResponse
                .replaceAll("```json", "").replaceAll("```", "").trim();

        String sentiment = extractJsonField(cleanJson, "sentiment", "NEUTRAL");
        double score = extractJsonFieldDouble(cleanJson, "sentimentScore", 0.0);
        String summary = extractJsonField(cleanJson, "summary", "Unable to determine sentiment.");

        return SentimentResultDto.builder()
                .ticker(ticker)
                .sentiment(sentiment)
                .sentimentScore(score)
                .summary(summary)
                .articleCount(0)  // Updated when article count tracking is added
                .build();
    }

    private String extractJsonField(String json, String key, String defaultValue) {
        try {
            int start = json.indexOf("\"" + key + "\"");
            if (start == -1) return defaultValue;
            int colon = json.indexOf(":", start) + 1;
            String rest = json.substring(colon).trim();
            if (rest.startsWith("\"")) {
                int end = rest.indexOf("\"", 1);
                return rest.substring(1, end);
            }
            return defaultValue;
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private double extractJsonFieldDouble(String json, String key, double defaultValue) {
        try {
            int start = json.indexOf("\"" + key + "\"");
            if (start == -1) return defaultValue;
            int colon = json.indexOf(":", start) + 1;
            String rest = json.substring(colon).trim();
            int end = rest.indexOf(",");
            if (end == -1) end = rest.indexOf("}");
            return Double.parseDouble(rest.substring(0, end).trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }
}
