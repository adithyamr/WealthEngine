package com.wealthengine.marketdata.client;

import com.wealthengine.common.dto.MarketTickDto;
import com.wealthengine.common.enums.ExchangeSegment;
import com.wealthengine.common.exception.MarketDataException;
import com.wealthengine.marketdata.config.DhanConfig;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

/**
 * REST client for Dhan market data snapshot endpoints.
 * Used as fallback when WebSocket is unavailable.
 *
 * Endpoint: POST https://api.dhan.co/v2/marketfeed/ltp
 * Headers: access-token, client-id, Content-Type: application/json
 * Body: {"NSE_EQ": [11536, 1333], "BSE_EQ": [500325]}
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DhanRestClient {

    private final DhanConfig dhanConfig;
    private final RestClient.Builder restClientBuilder;

    private RestClient dhanClient;

    @jakarta.annotation.PostConstruct
    void init() {
        dhanClient = restClientBuilder
                .baseUrl(dhanConfig.getBaseUrl())
                .defaultHeader("access-token", dhanConfig.getAccessToken())
                .defaultHeader("client-id", dhanConfig.getClientId())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Fetches Last Traded Price (LTP) snapshot for a single security.
     *
     * @param segment   The exchange segment (e.g., NSE_EQ)
     * @param securityId The Dhan security ID
     */
    @CircuitBreaker(name = "dhan-api", fallbackMethod = "ltpFallback")
    @Retry(name = "dhan-api")
    public MarketTickDto getLtp(ExchangeSegment segment, String securityId) {
        log.debug("Fetching LTP for {}/{} from Dhan REST", segment, securityId);

        Map<String, Object> requestBody = Map.of(
                segment.getCode(), List.of(Integer.parseInt(securityId))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = dhanClient.post()
                .uri("/v2/marketfeed/ltp")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return parseSnapshotResponse(response, securityId, segment);
    }

    /**
     * Fetches OHLC quote for a security.
     */
    @CircuitBreaker(name = "dhan-api", fallbackMethod = "ohlcFallback")
    @Retry(name = "dhan-api")
    public MarketTickDto getOhlc(ExchangeSegment segment, String securityId) {
        log.debug("Fetching OHLC for {}/{} from Dhan REST", segment, securityId);

        Map<String, Object> requestBody = Map.of(
                segment.getCode(), List.of(Integer.parseInt(securityId))
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = dhanClient.post()
                .uri("/v2/marketfeed/ohlc")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return parseSnapshotResponse(response, securityId, segment);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fallback Methods
    // ─────────────────────────────────────────────────────────────────────────

    public MarketTickDto ltpFallback(ExchangeSegment segment, String securityId, Exception ex) {
        log.error("Dhan API circuit breaker open for LTP {}/{}: {}", segment, securityId, ex.getMessage());
        throw new MarketDataException("Dhan LTP service unavailable. Market data temporarily unavailable.", ex);
    }

    public MarketTickDto ohlcFallback(ExchangeSegment segment, String securityId, Exception ex) {
        log.error("Dhan API circuit breaker open for OHLC {}/{}: {}", segment, securityId, ex.getMessage());
        throw new MarketDataException("Dhan OHLC service unavailable. Market data temporarily unavailable.", ex);
    }

    @SuppressWarnings("unchecked")
    private MarketTickDto parseSnapshotResponse(Map<String, Object> response, String securityId, ExchangeSegment segment) {
        if (response == null) {
            throw new MarketDataException("Empty response from Dhan API for security " + securityId);
        }

        // Dhan response nests data under segment code → [securityId] → {LTP, Open, High, Low, Close}
        Object segmentData = response.get(segment.getCode());
        if (!(segmentData instanceof Map)) {
            log.warn("Unexpected Dhan response format for {}: {}", securityId, response);
            throw new MarketDataException("Invalid Dhan API response format");
        }

        Map<String, Object> securityData = (Map<String, Object>) ((Map<?, ?>) segmentData).get(securityId);
        if (securityData == null) {
            throw new MarketDataException("Security " + securityId + " not found in Dhan response");
        }

        BigDecimal ltp = toBigDecimal(securityData.get("LTP"));
        BigDecimal open = toBigDecimal(securityData.getOrDefault("Open", 0));
        BigDecimal high = toBigDecimal(securityData.getOrDefault("High", 0));
        BigDecimal low = toBigDecimal(securityData.getOrDefault("Low", 0));
        BigDecimal close = toBigDecimal(securityData.getOrDefault("Close", ltp));

        return MarketTickDto.builder()
                .securityId(securityId)
                .exchangeSegment(segment)
                .lastTradedPrice(ltp)
                .openPrice(open)
                .highPrice(high)
                .lowPrice(low)
                .closePrice(close)
                .changeAbsolute(ltp.subtract(close))
                .changePercent(close.compareTo(BigDecimal.ZERO) != 0
                        ? ltp.subtract(close).divide(close, 4, java.math.RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO)
                .timestamp(Instant.now())
                .build();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        return new BigDecimal(value.toString());
    }
}
