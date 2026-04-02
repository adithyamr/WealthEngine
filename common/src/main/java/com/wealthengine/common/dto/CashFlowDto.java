package com.wealthengine.common.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

/**
 * Represents a single cashflow for XIRR calculation.
 */
@Data
@Builder
public class CashFlowDto {
    private LocalDate date;
    private double amount; // Negative = investment (outflow), Positive = returns (inflow)
}
