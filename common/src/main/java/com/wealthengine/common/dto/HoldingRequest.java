package com.wealthengine.common.dto;

import com.wealthengine.common.enums.AssetType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating or updating a portfolio holding.
 *
 * <p>
 * Field applicability by asset type:
 *
 * <pre>
 * STOCK / ETF        → symbol, name, quantity, purchasePrice, purchaseDate, exchange, sector, isin
 * MUTUAL_FUND        → name, quantity (units), purchasePrice (NAV), purchaseDate, amfiCode, isin, sector (fund category)
 * FD                 → name (bank), purchasePrice (principal), purchaseDate, interestRatePercent, maturityDate, maturityAmount
 * PPF                → name (branch/bank), purchasePrice (contribution), purchaseDate, interestRatePercent, maturityDate
 * NPS                → name (fund manager), quantity (units/NAV), purchasePrice, purchaseDate, symbol (PRAN)
 * EPF                → name (employer), purchasePrice (contribution), purchaseDate
 * BONDS              → name (issuer), symbol (ISIN), quantity, purchasePrice, purchaseDate, interestRatePercent, maturityDate, maturityAmount
 * GOLD               → name (scheme/physical), quantity (grams/units), purchasePrice, purchaseDate
 * CASH               → name (account), purchasePrice (balance), purchaseDate
 * CRYPTO             → symbol, name (coin), quantity, purchasePrice, purchaseDate
 * REAL_ESTATE        → name (property), purchasePrice, purchaseDate, sector (city/area)
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldingRequest {

    /** Required for update operations; null for create */
    private Long id;

    @NotNull(message = "Asset type is required")
    private AssetType assetType;

    /** NSE/BSE ticker, PRAN for NPS, ISIN for bonds. Optional for PPF/EPF/FD */
    private String symbol;

    @NotBlank(message = "Name is required (stock name / fund name / bank name / employer)")
    private String name;

    /**
     * Units for MF, shares for stocks, grams for gold, 1 for FD/PPF/EPF
     * contributions
     */
    @DecimalMin(value = "0.000001", message = "Quantity must be positive")
    private BigDecimal quantity;

    /** NAV (MF), price/share (STOCK), principal (FD/PPF/EPF), rate (bonds) */
    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.01", message = "Purchase price must be positive")
    private BigDecimal purchasePrice;

    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    /** Applicable to STOCK, ETF. Values: NSE, BSE */
    private String exchange;

    /**
     * Applies to STOCK, ETF (e.g., IT, Banking). For MF = category (Large Cap,
     * ELSS)
     */
    private String sector;

    /** Annual interest rate % — for FD, PPF, NPS, BONDS */
    @DecimalMin(value = "0", message = "Interest rate cannot be negative")
    private BigDecimal interestRatePercent;

    /** For FD, PPF, BONDS */
    private LocalDate maturityDate;

    /** Projected maturity amount for FD/Bonds */
    @DecimalMin(value = "0", message = "Maturity amount cannot be negative")
    private BigDecimal maturityAmount;

    /** ISIN for MF, STOCK, ETF, BONDS */
    private String isin;

    /** AMFI scheme code — for Mutual Funds */
    private String amfiCode;

    /**
     * Percentage of dividend/bonus reinvested — future use.
     * For now used as additional notes field.
     */
    private String notes;
}
