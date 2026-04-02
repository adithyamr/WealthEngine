package com.wealthengine.portfolioengine.algorithm;

import com.wealthengine.common.dto.CashFlowDto;
import com.wealthengine.common.exception.WealthEngineException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Newton-Raphson XIRR (Extended Internal Rate of Return) Calculator.
 *
 * <p>XIRR accounts for irregular cashflow dates, unlike simple IRR which assumes
 * equal time intervals. This implementation uses {@link BigDecimal} for high precision.
 *
 * <p>Formula: NPV = Σ [ Ci / (1 + r)^ti ]
 * where ti = (date_i - date_0) / 365
 *
 * <p>Newton-Raphson iteration: r_{n+1} = r_n - NPV(r_n) / NPV'(r_n)
 */
@Component
public class XirrCalculator {

    private static final MathContext MC = new MathContext(16, RoundingMode.HALF_UP);
    private static final double TOLERANCE = 1e-10;
    private static final int MAX_ITERATIONS = 1000;
    private static final double INITIAL_GUESS = 0.1; // 10% initial guess

    /**
     * Calculates the XIRR for a list of cashflows.
     *
     * @param cashFlows List of cashflows (negative = outflow/investment, positive = inflow/return).
     *                  Must contain at least one negative and one positive value.
     *                  The earliest date is used as the reference date (t=0).
     * @return The annualized XIRR as a decimal (e.g., 0.15 means 15% per annum)
     * @throws WealthEngineException if XIRR cannot be computed (insufficient data, no convergence)
     */
    public double calculate(List<CashFlowDto> cashFlows) {
        validateCashFlows(cashFlows);

        // Sort by date ascending; first date is reference (t=0)
        List<CashFlowDto> sorted = cashFlows.stream()
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .toList();

        LocalDate referenceDate = sorted.get(0).getDate();

        // Check all-zero case
        boolean allZero = sorted.stream().allMatch(cf -> cf.getAmount() == 0.0);
        if (allZero) return 0.0;

        // Newton-Raphson
        double rate = INITIAL_GUESS;
        for (int i = 0; i < MAX_ITERATIONS; i++) {
            double npv = computeNpv(sorted, referenceDate, rate);
            double npvDerivative = computeNpvDerivative(sorted, referenceDate, rate);

            if (Math.abs(npvDerivative) < 1e-15) {
                throw new WealthEngineException("XIRR derivative too small to converge. Check cashflows.",
                        "XIRR_NO_CONVERGENCE");
            }

            double newRate = rate - npv / npvDerivative;

            if (Math.abs(newRate - rate) < TOLERANCE) {
                return BigDecimal.valueOf(newRate)
                        .round(new MathContext(8, RoundingMode.HALF_UP))
                        .doubleValue();
            }
            rate = newRate;
        }

        throw new WealthEngineException(
                "XIRR did not converge after " + MAX_ITERATIONS + " iterations.",
                "XIRR_NO_CONVERGENCE"
        );
    }

    /**
     * Computes Net Present Value at the given rate.
     * NPV = Σ [ Ci / (1 + r)^ti ] where ti = days(date_i - date_0) / 365.0
     */
    private double computeNpv(List<CashFlowDto> cashFlows, LocalDate referenceDate, double rate) {
        double npv = 0.0;
        for (CashFlowDto cf : cashFlows) {
            double t = ChronoUnit.DAYS.between(referenceDate, cf.getDate()) / 365.0;
            npv += cf.getAmount() / Math.pow(1 + rate, t);
        }
        return npv;
    }

    /**
     * Computes the derivative of NPV with respect to rate.
     * NPV'(r) = Σ [ -ti * Ci / (1 + r)^(ti + 1) ]
     */
    private double computeNpvDerivative(List<CashFlowDto> cashFlows, LocalDate referenceDate, double rate) {
        double derivative = 0.0;
        for (CashFlowDto cf : cashFlows) {
            double t = ChronoUnit.DAYS.between(referenceDate, cf.getDate()) / 365.0;
            derivative += -t * cf.getAmount() / Math.pow(1 + rate, t + 1);
        }
        return derivative;
    }

    private void validateCashFlows(List<CashFlowDto> cashFlows) {
        if (cashFlows == null || cashFlows.size() < 2) {
            throw new WealthEngineException(
                    "XIRR requires at least 2 cashflows (investment + return).", "XIRR_INVALID_INPUT");
        }
        boolean hasNegative = cashFlows.stream().anyMatch(cf -> cf.getAmount() < 0);
        boolean hasPositive = cashFlows.stream().anyMatch(cf -> cf.getAmount() > 0);
        if (!hasNegative || !hasPositive) {
            throw new WealthEngineException(
                    "XIRR requires at least one negative (outflow) and one positive (inflow) cashflow.",
                    "XIRR_INVALID_INPUT"
            );
        }
    }
}
