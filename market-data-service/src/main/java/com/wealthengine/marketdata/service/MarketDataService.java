package com.wealthengine.marketdata.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.wealthengine.common.dto.MarketTickDto;
import com.wealthengine.common.enums.ExchangeSegment;
import com.wealthengine.common.exception.MarketDataException;
import com.wealthengine.marketdata.client.DhanRestClient;
import com.wealthengine.marketdata.websocket.DhanLiveFeedClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;

/**
 * Facade service for market data access.
 *
 * Strategy:
 * 1. Try Caffeine cache (populated by WebSocket live feed) — sub-millisecond
 * 2. Fall back to Dhan REST snapshot — ~200-500ms
 *
 * Cache: max 500 symbols, 5-second TTL (stale data is acceptable for portfolio display).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MarketDataService {

    private final DhanLiveFeedClient liveFeedClient;
    private final DhanRestClient restClient;

    // Caffeine cache: key = "${exchangeSegment.code}:${securityId}"
    private Cache<String, MarketTickDto> tickCache;

    @PostConstruct
    void initCache() {
        tickCache = Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(5, TimeUnit.SECONDS)
                .recordStats()
                .build();

        // Register WebSocket listener to populate cache
        liveFeedClient.addTickListener(tick -> {
            if (tick.getSecurityId() != null && tick.getExchangeSegment() != null) {
                String key = cacheKey(tick.getExchangeSegment(), tick.getSecurityId());
                tickCache.put(key, tick);
            }
        });
    }

    /**
     * Gets the latest market data tick for a security.
     * Tries WebSocket cache first, then falls back to REST snapshot.
     */
    public MarketTickDto getTick(ExchangeSegment segment, String securityId) {
        String key = cacheKey(segment, securityId);

        MarketTickDto cached = tickCache.getIfPresent(key);
        if (cached != null) {
            log.debug("Cache hit for {}", key);
            return cached;
        }

        log.debug("Cache miss for {}, fetching from Dhan REST", key);
        MarketTickDto tick = restClient.getOhlc(segment, securityId);
        tickCache.put(key, tick);
        return tick;
    }

    /**
     * Gets tick by NSE symbol (looks up security ID internally).
     * Convenience method for API consumers.
     */
    public MarketTickDto getTickBySymbol(String symbol) {
        // In a real implementation, this would look up securityId from a symbol→securityId map
        // seeded from Dhan's instrument master file
        throw new MarketDataException("Symbol lookup not yet implemented. Use securityId directly.");
    }

    /**
     * Returns Caffeine cache statistics (hit rate, miss rate, etc.)
     */
    public String getCacheStats() {
        return tickCache.stats().toString();
    }

    private String cacheKey(ExchangeSegment segment, String securityId) {
        return segment.getCode() + ":" + securityId;
    }
}
