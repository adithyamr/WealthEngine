package com.wealthengine.gateway.controller;

import com.wealthengine.agent.service.AnalysisAgentService;
import com.wealthengine.common.dto.RecommendationDto;
import com.wealthengine.nli.service.NliService;
import com.wealthengine.sentiment.service.SentimentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "AI Analysis", description = "Sentiment, NLI, and Agentic stock analysis")
public class AgentController {

    private final AnalysisAgentService analysisAgentService;
    private final NliService nliService;
    private final SentimentService sentimentService;

    @PostMapping("/analyze/{ticker}")
    @Operation(summary = "Run deep-dive multi-step agent analysis on a stock ticker")
    public ResponseEntity<RecommendationDto> analyzeStock(
            @PathVariable String ticker,
            @RequestParam(defaultValue = "") String securityId) {
        return ResponseEntity.ok(analysisAgentService.analyzeStock(ticker, securityId));
    }

    @PostMapping("/chat")
    @Operation(summary = "Natural language portfolio query via Spring AI Tool Calling")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String query = request.getOrDefault("message", "");
        String response = nliService.query(query);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/sentiment/{ticker}")
    @Operation(summary = "Get news sentiment analysis for a stock ticker via RAG")
    public ResponseEntity<?> getSentiment(@PathVariable String ticker) {
        return ResponseEntity.ok(sentimentService.getSentiment(ticker));
    }

    @PostMapping("/sentiment/{ticker}/ingest")
    @Operation(summary = "Trigger on-demand news ingestion for a ticker into PGVector")
    public ResponseEntity<Map<String, String>> ingestNews(@PathVariable String ticker) {
        sentimentService.ingestNewsForTicker(ticker);
        return ResponseEntity.ok(Map.of("status", "Ingestion triggered for " + ticker));
    }
}
