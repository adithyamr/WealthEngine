import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PortfolioSummary {
    totalNetWorth: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    totalGainLossPostTax: number;
    totalGainLossPostTaxPercent: number;
    xirrPercent: number;
    allocationByType: Record<string, number>;
    allocationBySector: Record<string, number>;
    topHoldings: AssetDto[];
}

export interface AssetDto {
    id: number;
    assetType: string;
    symbol: string;
    name: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    purchaseDate: string;
    // Computed
    currentValue: number;
    investedValue: number;
    gainLoss: number;
    gainLossPercent: number;
    // Equity
    sector: string;
    exchange: string;
    isin: string;
    // Debt / fixed income
    interestRatePercent: number;
    maturityDate: string;
    maturityAmount: number;
    // MF
    amfiCode: string;
    // Extra
    notes: string;
    // Tax
    gainLossPostTax?: number;
    gainLossPostTaxPercent?: number;
    ltcgEligible?: boolean;
}

export interface HoldingRequest {
    assetType: string;
    symbol?: string;
    name: string;
    quantity?: number;
    purchasePrice: number;
    purchaseDate: string;
    exchange?: string;
    sector?: string;
    interestRatePercent?: number;
    maturityDate?: string;
    maturityAmount?: number;
    isin?: string;
    amfiCode?: string;
    notes?: string;
}

export interface RecommendationDto {
    ticker: string;
    action: string;
    reasoning: string;
    riskLevel: string;
    confidenceScore: number;
    generatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
    private readonly baseUrl = '/api/v1';

    constructor(private http: HttpClient) { }

    // ─── Portfolio Overview ───────────────────────────────────────────────────
    getSummary(): Observable<PortfolioSummary> {
        return this.http.get<PortfolioSummary>(`${this.baseUrl}/portfolio/summary`);
    }

    getXirr(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/portfolio/xirr`);
    }

    getSectors(): Observable<Record<string, number>> {
        return this.http.get<Record<string, number>>(`${this.baseUrl}/portfolio/sectors`);
    }

    // ─── Holdings CRUD ────────────────────────────────────────────────────────
    getAllHoldings(): Observable<AssetDto[]> {
        return this.http.get<AssetDto[]>(`${this.baseUrl}/portfolio/holdings`);
    }

    getHoldingsByType(assetType: string): Observable<AssetDto[]> {
        return this.http.get<AssetDto[]>(`${this.baseUrl}/portfolio/holdings/by-type/${assetType}`);
    }

    createHolding(req: HoldingRequest): Observable<AssetDto> {
        return this.http.post<AssetDto>(`${this.baseUrl}/portfolio/holdings`, req);
    }

    updateHolding(id: number, req: HoldingRequest): Observable<AssetDto> {
        return this.http.put<AssetDto>(`${this.baseUrl}/portfolio/holdings/${id}`, req);
    }

    deleteHolding(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/portfolio/holdings/${id}`);
    }

    // ─── AI / Agent ───────────────────────────────────────────────────────────
    analyzeStock(ticker: string, securityId: string = ''): Observable<RecommendationDto> {
        return this.http.post<RecommendationDto>(`${this.baseUrl}/analyze/${ticker}?securityId=${securityId}`, {});
    }

    chat(message: string): Observable<{ response: string }> {
        return this.http.post<{ response: string }>(`${this.baseUrl}/chat`, { message });
    }

    getSentiment(ticker: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/sentiment/${ticker}`);
    }

    // ─── Auth ───────────────────────────────────────────────────────────────
    login(username: string, password: string): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, { username, password });
    }
}
