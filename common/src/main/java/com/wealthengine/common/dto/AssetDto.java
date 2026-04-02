package com.wealthengine.common.dto;

import com.wealthengine.common.enums.AssetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO representing a single portfolio holding (any asset type).
 * Contains computed values (currentValue, gainLoss) alongside raw holding data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDto {
    private Long id;
    private AssetType assetType;
    private String symbol;
    private String name;
    private BigDecimal quantity;
    private BigDecimal purchasePrice;
    private BigDecimal currentPrice;
    private LocalDate purchaseDate;

    // Computed fields
    private BigDecimal currentValue;
    private BigDecimal investedValue;
    private BigDecimal gainLoss;
    private BigDecimal gainLossPercent;

    // Equity-specific
    private String sector;
    private String exchange;
    private String isin;

    // Debt / fixed-income specific
    private BigDecimal interestRatePercent;
    private LocalDate maturityDate;
    private BigDecimal maturityAmount;

    // MF specific
    private String amfiCode;

    // Additional notes (NPS PRAN, EPF account number, property description, etc.)
    private String notes;
}
