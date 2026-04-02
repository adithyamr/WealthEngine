package com.wealthengine.portfolioengine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Tracks all buy/sell/dividend transactions for a holding.
 * Used as input for XIRR cashflow calculations.
 */
@Entity
@Table(name = "transactions",
        indexes = {
                @Index(name = "idx_tx_holding", columnList = "holding_id"),
                @Index(name = "idx_tx_date", columnList = "transaction_date"),
                @Index(name = "idx_tx_user", columnList = "user_id")
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holding_id", nullable = false)
    private Holding holding;

    @Column(nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(precision = 20, scale = 6, nullable = false)
    private BigDecimal quantity;

    @Column(precision = 20, scale = 4, nullable = false)
    private BigDecimal price;

    @Column(precision = 20, scale = 4, nullable = false)
    private BigDecimal totalAmount;     // quantity * price + charges

    @Column(precision = 10, scale = 4)
    private BigDecimal brokerage;       // Brokerage / STT / charges

    @Column(precision = 10, scale = 4)
    private BigDecimal taxes;           // STT, LTCG, STCG taxes

    private String notes;

    @CreationTimestamp
    private Instant createdAt;

    public enum TransactionType {
        BUY, SELL, DIVIDEND, BONUS, SPLIT, MERGER, SIP, REDEMPTION, INTEREST, CONTRIBUTION
    }
}
