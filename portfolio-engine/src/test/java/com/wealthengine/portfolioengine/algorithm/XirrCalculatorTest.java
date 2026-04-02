package com.wealthengine.portfolioengine.algorithm;

import com.wealthengine.common.dto.CashFlowDto;
import com.wealthengine.common.exception.WealthEngineException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for the Newton-Raphson XIRR calculator.
 *
 * Known reference values computed using Excel's XIRR function.
 */
class XirrCalculatorTest {

    private XirrCalculator xirrCalculator;

    @BeforeEach
    void setUp() {
        xirrCalculator = new XirrCalculator();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HAPPY PATH TESTS
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("SIP monthly for 1 year → expect ~12% XIRR")
    void sipMonthly12Months_shouldReturn12Percent() {
        // Monthly SIP of ₹10,000 for 12 months, redeem ₹1,28,000 at end
        LocalDate start = LocalDate.of(2023, 1, 1);
        List<CashFlowDto> cashFlows = new java.util.ArrayList<>();
        for (int i = 0; i < 12; i++) {
            cashFlows.add(CashFlowDto.builder()
                    .date(start.plusMonths(i))
                    .amount(-10_000.0) // outflow
                    .build());
        }
        // Terminal inflow - slightly above invested (positive return)
        cashFlows.add(CashFlowDto.builder()
                .date(start.plusMonths(12))
                .amount(128_000.0)   // inflow - ~6.7% absolute return ≈ 12% annualized
                .build());

        double xirr = xirrCalculator.calculate(cashFlows);

        // Should converge to roughly 12% ± 2%
        assertThat(xirr).isGreaterThan(0.10).isLessThan(0.14);
    }

    @Test
    @DisplayName("Single lump-sum: ₹1L → ₹1.5L over 3 years → ~14.5% XIRR")
    void lumpSumInvestment_shouldReturnCorrectXirr() {
        // Invest ₹1,00,000 on Jan 1 2020, receive ₹1,50,000 on Jan 1 2023 (3 years)
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.of(2020, 1, 1)).amount(-100_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2023, 1, 1)).amount(150_000.0).build()
        );

        double xirr = xirrCalculator.calculate(cashFlows);

        // (1.5)^(1/3) - 1 ≈ 0.1447 = 14.47%
        assertThat(xirr).isCloseTo(0.1447, within(0.001));
    }

    @Test
    @DisplayName("Irregular cashflows with multiple inflows and outflows")
    void irregularCashFlows_shouldConverge() {
        // Simulates multiple purchases + partial sell + final redemption
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.of(2022, 1, 15)).amount(-50_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2022, 6, 10)).amount(-30_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2022, 9, 22)).amount(15_000.0).build(), // partial sell
                CashFlowDto.builder().date(LocalDate.of(2023, 3, 30)).amount(-20_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2024, 1, 15)).amount(120_000.0).build()  // final redemption
        );

        double xirr = xirrCalculator.calculate(cashFlows);

        // Net investment: 85000, Net inflow at end: 135000 over ~2 years → expect positive XIRR
        assertThat(xirr).isGreaterThan(0.15).isLessThan(0.40);
    }

    @Test
    @DisplayName("Negative returns: invest more than you get back")
    void negativeReturns_shouldReturnNegativeXirr() {
        // Invest ₹1L, get back only ₹80,000 after 1 year → -20% XIRR
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.of(2023, 1, 1)).amount(-100_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2024, 1, 1)).amount(80_000.0).build()
        );

        double xirr = xirrCalculator.calculate(cashFlows);
        assertThat(xirr).isCloseTo(-0.20, within(0.001));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // EDGE CASES
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("All-zero cashflows → returns 0.0")
    void allZeroCashFlows_shouldReturnZero() {
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.of(2023, 1, 1)).amount(0.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2024, 1, 1)).amount(0.0).build()
        );

        double xirr = xirrCalculator.calculate(cashFlows);
        assertThat(xirr).isEqualTo(0.0);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // VALIDATION TESTS
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Null cashflows → throws WealthEngineException")
    void nullCashFlows_shouldThrowException() {
        assertThatThrownBy(() -> xirrCalculator.calculate(null))
                .isInstanceOf(WealthEngineException.class)
                .hasMessageContaining("at least 2 cashflows");
    }

    @Test
    @DisplayName("Single cashflow → throws WealthEngineException")
    void singleCashFlow_shouldThrowException() {
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.now()).amount(-10_000.0).build()
        );
        assertThatThrownBy(() -> xirrCalculator.calculate(cashFlows))
                .isInstanceOf(WealthEngineException.class)
                .hasMessageContaining("at least 2 cashflows");
    }

    @Test
    @DisplayName("All negative cashflows (no inflow) → throws WealthEngineException")
    void allNegativeCashFlows_shouldThrowException() {
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.of(2023, 1, 1)).amount(-10_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2023, 6, 1)).amount(-5_000.0).build()
        );
        assertThatThrownBy(() -> xirrCalculator.calculate(cashFlows))
                .isInstanceOf(WealthEngineException.class)
                .hasMessageContaining("one positive");
    }

    @Test
    @DisplayName("All positive cashflows (no outflow) → throws WealthEngineException")
    void allPositiveCashFlows_shouldThrowException() {
        List<CashFlowDto> cashFlows = List.of(
                CashFlowDto.builder().date(LocalDate.of(2023, 1, 1)).amount(10_000.0).build(),
                CashFlowDto.builder().date(LocalDate.of(2023, 6, 1)).amount(5_000.0).build()
        );
        assertThatThrownBy(() -> xirrCalculator.calculate(cashFlows))
                .isInstanceOf(WealthEngineException.class)
                .hasMessageContaining("one negative");
    }
}
