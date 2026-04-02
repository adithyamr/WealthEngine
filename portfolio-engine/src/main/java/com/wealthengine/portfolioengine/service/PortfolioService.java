package com.wealthengine.portfolioengine.service;

import com.wealthengine.common.dto.*;
import com.wealthengine.common.enums.AssetType;
import com.wealthengine.common.exception.WealthEngineException;
import com.wealthengine.portfolioengine.algorithm.XirrCalculator;
import com.wealthengine.portfolioengine.entity.Holding;
import com.wealthengine.portfolioengine.entity.Transaction;
import com.wealthengine.portfolioengine.repository.HoldingRepository;
import com.wealthengine.portfolioengine.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core portfolio service — the "Source of Truth" for all portfolio operations.
 * Handles aggregation, XIRR calculation, sector concentration, CRUD for holdings.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PortfolioService {

    private final HoldingRepository holdingRepository;
    private final TransactionRepository transactionRepository;
    private final XirrCalculator xirrCalculator;

    // ─── READ ────────────────────────────────────────────────────────────────

    public BigDecimal getTotalNetWorth(String userId) {
        return holdingRepository.findByUserIdAndActiveTrue(userId).stream()
                .map(this::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<AssetDto> getHoldingsByType(String userId, AssetType assetType) {
        return holdingRepository
                .findByUserIdAndAssetTypeAndActiveTrue(userId, assetType)
                .stream()
                .map(this::toAssetDto)
                .collect(Collectors.toList());
    }

    public List<AssetDto> getAllHoldings(String userId) {
        return holdingRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .sorted(Comparator.comparing(Holding::getAssetType)
                        .thenComparing(h -> h.getName().toLowerCase()))
                .map(this::toAssetDto)
                .collect(Collectors.toList());
    }

    public AssetDto getHoldingById(String userId, Long holdingId) {
        Holding h = holdingRepository.findById(holdingId)
                .filter(holding -> holding.getUserId().equals(userId) && holding.isActive())
                .orElseThrow(() -> new WealthEngineException("Holding not found: " + holdingId, "NOT_FOUND"));
        return toAssetDto(h);
    }

    public Map<AssetType, BigDecimal> getAllocationByType(String userId) {
        List<Holding> holdings = holdingRepository.findByUserIdAndActiveTrue(userId);
        BigDecimal totalValue = holdings.stream()
                .map(h -> getCurrentValue(h))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalValue.compareTo(BigDecimal.ZERO) == 0) return Collections.emptyMap();

        return holdings.stream()
                .collect(Collectors.groupingBy(
                        Holding::getAssetType,
                        Collectors.reducing(BigDecimal.ZERO,
                                h -> getCurrentValue(h).divide(totalValue, 4, RoundingMode.HALF_UP),
                                BigDecimal::add)
                ));
    }

    public Map<String, BigDecimal> getSectorConcentration(String userId) {
        List<Holding> equityHoldings = holdingRepository.findByUserIdAndActiveTrue(userId).stream()
                .filter(h -> h.getAssetType() == AssetType.STOCK || h.getAssetType() == AssetType.ETF)
                .filter(h -> h.getSector() != null)
                .collect(Collectors.toList());

        BigDecimal totalEquity = equityHoldings.stream()
                .map(this::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalEquity.compareTo(BigDecimal.ZERO) == 0) return Collections.emptyMap();

        return equityHoldings.stream()
                .collect(Collectors.groupingBy(
                        Holding::getSector,
                        Collectors.reducing(BigDecimal.ZERO,
                                h -> getCurrentValue(h).divide(totalEquity, 4, RoundingMode.HALF_UP),
                                BigDecimal::add)
                ));
    }

    public double getPortfolioXirr(String userId) {
        List<Transaction> txs = transactionRepository.findByUserIdOrderByTransactionDateAsc(userId);

        List<CashFlowDto> cashFlows = txs.stream()
                .map(tx -> CashFlowDto.builder()
                        .date(tx.getTransactionDate())
                        .amount(tx.getType() == Transaction.TransactionType.BUY ||
                                tx.getType() == Transaction.TransactionType.SIP
                                ? -tx.getTotalAmount().doubleValue()
                                : tx.getTotalAmount().doubleValue())
                        .build())
                .collect(Collectors.toList());

        BigDecimal currentValue = getTotalNetWorth(userId);
        cashFlows.add(CashFlowDto.builder()
                .date(LocalDate.now())
                .amount(currentValue.doubleValue())
                .build());

        return xirrCalculator.calculate(cashFlows);
    }

    public PortfolioSummaryDto getPortfolioSummary(String userId) {
        List<Holding> holdings = holdingRepository.findByUserIdAndActiveTrue(userId);

        BigDecimal totalValue = holdings.stream()
                .map(this::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalInvested = holdings.stream()
                .map(h -> h.getPurchasePrice().multiply(
                        h.getQuantity() != null ? h.getQuantity() : BigDecimal.ONE))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gainLoss = totalValue.subtract(totalInvested);
        BigDecimal gainLossPercent = totalInvested.compareTo(BigDecimal.ZERO) != 0
                ? gainLoss.divide(totalInvested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        double xirr = 0.0;
        try {
            xirr = getPortfolioXirr(userId);
        } catch (Exception e) {
            log.warn("Could not calculate XIRR for user {}: {}", userId, e.getMessage());
        }

        List<AssetDto> topHoldings = holdings.stream()
                .sorted(Comparator.comparing(this::getCurrentValue, Comparator.reverseOrder()))
                .limit(10)
                .map(this::toAssetDto)
                .collect(Collectors.toList());

        return PortfolioSummaryDto.builder()
                .totalNetWorth(totalValue)
                .totalInvested(totalInvested)
                .totalGainLoss(gainLoss)
                .totalGainLossPercent(gainLossPercent)
                .xirrPercent(BigDecimal.valueOf(xirr * 100).setScale(2, RoundingMode.HALF_UP))
                .allocationByType(getAllocationByType(userId))
                .allocationBySector(getSectorConcentration(userId))
                .topHoldings(topHoldings)
                .build();
    }

    // ─── WRITE (CRUD) ─────────────────────────────────────────────────────────

    @Transactional
    public AssetDto addHolding(String userId, HoldingRequest req) {
        Holding holding = fromRequest(req, userId);
        holding = holdingRepository.save(holding);
        log.info("Added holding: userId={}, type={}, name={}", userId, req.getAssetType(), req.getName());

        // Create an initial BUY transaction for audit trail
        Transaction tx = Transaction.builder()
                .holding(holding)
                .userId(userId)
                .type(Transaction.TransactionType.BUY)
                .transactionDate(req.getPurchaseDate())
                .quantity(req.getQuantity() != null ? req.getQuantity() : BigDecimal.ONE)
                .price(req.getPurchasePrice())
                .totalAmount(req.getPurchasePrice().multiply(
                        req.getQuantity() != null ? req.getQuantity() : BigDecimal.ONE))
                .brokerage(BigDecimal.ZERO)
                .taxes(BigDecimal.ZERO)
                .notes("Initial holding created via WealthEngine")
                .build();
        transactionRepository.save(tx);

        return toAssetDto(holding);
    }

    @Transactional
    public AssetDto updateHolding(String userId, Long holdingId, HoldingRequest req) {
        Holding existing = holdingRepository.findById(holdingId)
                .filter(h -> h.getUserId().equals(userId) && h.isActive())
                .orElseThrow(() -> new WealthEngineException("Holding not found: " + holdingId, "NOT_FOUND"));

        // Selectively update fields (do not overwrite if null)
        if (req.getSymbol() != null) existing.setSymbol(req.getSymbol());
        if (req.getName() != null) existing.setName(req.getName());
        if (req.getQuantity() != null) existing.setQuantity(req.getQuantity());
        if (req.getPurchasePrice() != null) existing.setPurchasePrice(req.getPurchasePrice());
        if (req.getPurchaseDate() != null) existing.setPurchaseDate(req.getPurchaseDate());
        if (req.getExchange() != null) existing.setExchange(req.getExchange());
        if (req.getSector() != null) existing.setSector(req.getSector());
        if (req.getInterestRatePercent() != null) existing.setInterestRatePercent(req.getInterestRatePercent());
        if (req.getMaturityDate() != null) existing.setMaturityDate(req.getMaturityDate());
        if (req.getMaturityAmount() != null) existing.setMaturityAmount(req.getMaturityAmount());
        if (req.getIsin() != null) existing.setIsin(req.getIsin());
        if (req.getAmfiCode() != null) existing.setAmfiCode(req.getAmfiCode());
        if (req.getNotes() != null) existing.setNotes(req.getNotes());

        Holding updated = holdingRepository.save(existing);
        log.info("Updated holding: id={}, userId={}", holdingId, userId);
        return toAssetDto(updated);
    }

    @Transactional
    public void deleteHolding(String userId, Long holdingId) {
        Holding holding = holdingRepository.findById(holdingId)
                .filter(h -> h.getUserId().equals(userId) && h.isActive())
                .orElseThrow(() -> new WealthEngineException("Holding not found: " + holdingId, "NOT_FOUND"));

        // Soft delete
        holding.setActive(false);
        holdingRepository.save(holding);
        log.info("Soft-deleted holding: id={}, userId={}", holdingId, userId);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private Holding fromRequest(HoldingRequest req, String userId) {
        return Holding.builder()
                .userId(userId)
                .assetType(req.getAssetType())
                .symbol(req.getSymbol() != null ? req.getSymbol().toUpperCase() : null)
                .name(req.getName())
                .quantity(req.getQuantity() != null ? req.getQuantity() : BigDecimal.ONE)
                .purchasePrice(req.getPurchasePrice())
                .purchaseDate(req.getPurchaseDate())
                .exchange(req.getExchange())
                .sector(req.getSector())
                .interestRatePercent(req.getInterestRatePercent())
                .maturityDate(req.getMaturityDate())
                .maturityAmount(req.getMaturityAmount())
                .isin(req.getIsin())
                .amfiCode(req.getAmfiCode())
                .notes(req.getNotes())
                .active(true)
                .build();
    }

    private BigDecimal getCurrentValue(Holding h) {
        if (h.getAssetType() == AssetType.FD || h.getAssetType() == AssetType.PPF
                || h.getAssetType() == AssetType.BONDS) {
            return computeAccruedValue(h);
        }
        if (h.getCurrentPrice() == null) {
            // Fallback to purchase price if no live price available
            return h.getPurchasePrice().multiply(
                    h.getQuantity() != null ? h.getQuantity() : BigDecimal.ONE);
        }
        return h.getCurrentPrice().multiply(
                h.getQuantity() != null ? h.getQuantity() : BigDecimal.ONE);
    }

    /**
     * Estimates accrued value for fixed-income instruments using simple interest.
     */
    private BigDecimal computeAccruedValue(Holding h) {
        if (h.getInterestRatePercent() == null) {
            return h.getPurchasePrice().multiply(
                    h.getQuantity() != null ? h.getQuantity() : BigDecimal.ONE);
        }
        long daysHeld = java.time.temporal.ChronoUnit.DAYS.between(h.getPurchaseDate(), LocalDate.now());
        BigDecimal principal = h.getPurchasePrice().multiply(
                h.getQuantity() != null ? h.getQuantity() : BigDecimal.ONE);
        BigDecimal interest = principal
                .multiply(h.getInterestRatePercent())
                .multiply(BigDecimal.valueOf(daysHeld))
                .divide(BigDecimal.valueOf(36500), 4, RoundingMode.HALF_UP);
        return principal.add(interest);
    }

    private AssetDto toAssetDto(Holding h) {
        BigDecimal currentValue = getCurrentValue(h);
        BigDecimal qty = h.getQuantity() != null ? h.getQuantity() : BigDecimal.ONE;
        BigDecimal investedValue = h.getPurchasePrice().multiply(qty);
        BigDecimal gainLoss = currentValue.subtract(investedValue);
        BigDecimal gainLossPercent = investedValue.compareTo(BigDecimal.ZERO) != 0
                ? gainLoss.divide(investedValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return AssetDto.builder()
                .id(h.getId())
                .assetType(h.getAssetType())
                .symbol(h.getSymbol())
                .name(h.getName())
                .quantity(h.getQuantity())
                .purchasePrice(h.getPurchasePrice())
                .currentPrice(h.getCurrentPrice())
                .purchaseDate(h.getPurchaseDate())
                .currentValue(currentValue)
                .investedValue(investedValue)
                .gainLoss(gainLoss)
                .gainLossPercent(gainLossPercent)
                .sector(h.getSector())
                .exchange(h.getExchange())
                .isin(h.getIsin())
                .interestRatePercent(h.getInterestRatePercent())
                .maturityDate(h.getMaturityDate())
                .maturityAmount(h.getMaturityAmount())
                .amfiCode(h.getAmfiCode())
                .notes(h.getNotes())
                .build();
    }
}
