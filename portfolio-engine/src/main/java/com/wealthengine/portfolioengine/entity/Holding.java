package com.wealthengine.portfolioengine.entity;

import com.wealthengine.common.enums.AssetType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Represents a portfolio holding. Covers all asset types: STOCK, MF, ETF, PPF, FD, NPS, EPF.
 */
@Entity
@Table(name = "holdings",
        indexes = {
                @Index(name = "idx_holding_user", columnList = "user_id"),
                @Index(name = "idx_holding_type", columnList = "asset_type"),
                @Index(name = "idx_holding_symbol", columnList = "symbol")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;  // Foreign key to users table

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType assetType;

    @Column(length = 30)
    private String symbol;      // NSE/BSE ticker (null for PPF, EPF, NPS)

    @Column(nullable = false, length = 200)
    private String name;        // Fund name / stock name / scheme name

    @Column(precision = 20, scale = 6)
    private BigDecimal quantity; // Units for MF, shares for stocks, principal for FD

    @Column(precision = 20, scale = 4, nullable = false)
    private BigDecimal purchasePrice;   // NAV for MF, price per share for stocks

    @Column(name = "purchased_at", nullable = false)
    private LocalDate purchaseDate;

    @Column(length = 20)
    private String exchange;    // NSE / BSE (for stocks/ETFs)

    @Column(length = 100)
    private String sector;      // IT / Banking / Pharma etc.

    // Fields specific to debt instruments
    @Column(precision = 5, scale = 2)
    private BigDecimal interestRatePercent; // For FD/PPF/NPS

    private LocalDate maturityDate;         // For FD/PPF

    @Column(precision = 20, scale = 4)
    private BigDecimal maturityAmount;      // Projected maturity for FD

    // Current market price — refreshed by market-data-service
    @Column(name = "current_price", precision = 20, scale = 4)
    private BigDecimal currentPrice;

    // ISIN for MF/stocks
    @Column(length = 12)
    private String isin;

    // AMFI code for Mutual Funds
    @Column(length = 20)
    private String amfiCode;

    // Additional notes: NPS PRAN, EPF account number, property address etc.
    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @OneToMany(mappedBy = "holding", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;
}
