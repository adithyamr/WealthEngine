package com.wealthengine.gateway.controller;

import com.wealthengine.common.dto.AssetDto;
import com.wealthengine.common.dto.HoldingRequest;
import com.wealthengine.common.dto.PortfolioSummaryDto;
import com.wealthengine.common.enums.AssetType;
import com.wealthengine.portfolioengine.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Portfolio management: CRUD for holdings, summary, XIRR, sector analysis")
public class PortfolioController {

    private final PortfolioService portfolioService;
    // TODO: replace MOCK_USER with SecurityContextHolder.getContext().getAuthentication().getName()
    private static final String MOCK_USER = "current-user";

    // ─── Portfolio Overview ───────────────────────────────────────────────────

    @GetMapping("/summary")
    @Operation(summary = "Full portfolio summary: net worth, XIRR, allocation, top holdings")
    public ResponseEntity<PortfolioSummaryDto> getSummary() {
        return ResponseEntity.ok(portfolioService.getPortfolioSummary(MOCK_USER));
    }

    @GetMapping("/xirr")
    @Operation(summary = "Annualized XIRR for the entire portfolio")
    public ResponseEntity<Double> getXirr() {
        return ResponseEntity.ok(portfolioService.getPortfolioXirr(MOCK_USER));
    }

    @GetMapping("/sectors")
    @Operation(summary = "Sector concentration map for equity holdings (STOCK + ETF)")
    public ResponseEntity<Map<String, ?>> getSectorConcentration() {
        return ResponseEntity.ok(portfolioService.getSectorConcentration(MOCK_USER));
    }

    // ─── Holdings Read ────────────────────────────────────────────────────────

    @GetMapping("/holdings")
    @Operation(summary = "Get all active holdings (sorted by asset type, then name)")
    public ResponseEntity<List<AssetDto>> getAllHoldings() {
        return ResponseEntity.ok(portfolioService.getAllHoldings(MOCK_USER));
    }

    @GetMapping("/holdings/by-type/{assetType}")
    @Operation(summary = "Get holdings filtered by asset type",
               description = "Valid types: STOCK, MUTUAL_FUND, ETF, PPF, FD, NPS, EPF, BONDS, GOLD, CASH, CRYPTO")
    public ResponseEntity<List<AssetDto>> getHoldingsByType(
            @PathVariable @Parameter(description = "Asset type enum") AssetType assetType) {
        return ResponseEntity.ok(portfolioService.getHoldingsByType(MOCK_USER, assetType));
    }

    @GetMapping("/holdings/{id}")
    @Operation(summary = "Get a single holding by ID")
    public ResponseEntity<AssetDto> getHoldingById(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getHoldingById(MOCK_USER, id));
    }

    // ─── Holdings Write ───────────────────────────────────────────────────────

    @PostMapping("/holdings")
    @Operation(summary = "Add a new holding",
               description = "Asset-type-specific fields: STOCK needs symbol+quantity+exchange, FD needs interestRatePercent+maturityDate, MF needs amfiCode etc.")
    public ResponseEntity<AssetDto> addHolding(@RequestBody @Valid HoldingRequest request) {
        AssetDto created = portfolioService.addHolding(MOCK_USER, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/holdings/{id}")
    @Operation(summary = "Update an existing holding (PATCH semantics — only populated fields are updated)")
    public ResponseEntity<AssetDto> updateHolding(
            @PathVariable Long id,
            @RequestBody HoldingRequest request) {
        return ResponseEntity.ok(portfolioService.updateHolding(MOCK_USER, id, request));
    }

    @DeleteMapping("/holdings/{id}")
    @Operation(summary = "Soft-delete a holding (sets active=false; preserves transaction history)")
    public ResponseEntity<Void> deleteHolding(@PathVariable Long id) {
        portfolioService.deleteHolding(MOCK_USER, id);
        return ResponseEntity.noContent().build();
    }
}
