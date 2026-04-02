package com.wealthengine.common.dto;

import com.wealthengine.common.enums.ExchangeSegment;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Real-time market tick data from Dhan WebSocket or REST snapshot.
 */
@Data
@Builder
public class MarketTickDto {
    private String securityId;
    private String symbol;
    private ExchangeSegment exchangeSegment;
    private BigDecimal lastTradedPrice;
    private BigDecimal openPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal closePrice;
    private Long volume;
    private BigDecimal changeAbsolute;
    private BigDecimal changePercent;
    private Instant timestamp;
}
