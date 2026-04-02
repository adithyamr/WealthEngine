package com.wealthengine.common.dto;

import com.wealthengine.common.enums.AssetType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Aggregated portfolio summary DTO returned by api-gateway.
 */
@Data
@Builder
public class PortfolioSummaryDto {
    private BigDecimal totalNetWorth;
    private BigDecimal totalInvested;
    private BigDecimal totalGainLoss;
    private BigDecimal totalGainLossPercent;
    private BigDecimal xirrPercent; // Annualized XIRR across entire portfolio
    private Map<AssetType, BigDecimal> allocationByType; // e.g. STOCK → 45%
    private Map<String, BigDecimal> allocationBySector; // e.g. IT → 22%
    private List<AssetDto> topHoldings; // Top 10 by current value
    private List<AssetDto> rebalancingSuggestions;
}
