import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PortfolioService, AssetDto, PortfolioSummary, HoldingRequest, RecommendationDto } from './portfolio.service';

@Injectable({ providedIn: 'root' })
export class MockPortfolioService extends PortfolioService {
    private mockHoldings: AssetDto[] = [
        {
            id: 1,
            assetType: 'STOCK',
            symbol: 'RELIANCE',
            name: 'Reliance Industries',
            quantity: 10,
            purchasePrice: 2400,
            currentPrice: 2950,
            purchaseDate: '2023-01-15',
            currentValue: 29500,
            investedValue: 24000,
            gainLoss: 5500,
            gainLossPercent: 22.92,
            sector: 'Energy',
            exchange: 'NSE',
            isin: 'INE002A01018',
            interestRatePercent: 0,
            maturityDate: '',
            maturityAmount: 0,
            amfiCode: '',
            notes: 'Blue chip stock'
        },
        {
            id: 2,
            assetType: 'MUTUAL_FUND',
            symbol: 'HDFC_TOP_100',
            name: 'HDFC Top 100 Fund',
            quantity: 500,
            purchasePrice: 450,
            currentPrice: 520,
            purchaseDate: '2022-06-10',
            currentValue: 260000,
            investedValue: 225000,
            gainLoss: 35000,
            gainLossPercent: 15.56,
            sector: 'Diversified',
            exchange: '',
            isin: '',
            interestRatePercent: 0,
            maturityDate: '',
            maturityAmount: 0,
            amfiCode: '100033',
            notes: 'SIP'
        },
        {
            id: 3,
            assetType: 'FD',
            symbol: 'SBI_FD_2024',
            name: 'SBI Fixed Deposit',
            quantity: 1,
            purchasePrice: 100000,
            currentPrice: 100000,
            purchaseDate: '2023-11-20',
            currentValue: 100000,
            investedValue: 100000,
            gainLoss: 7500,
            gainLossPercent: 7.5,
            sector: 'Banking',
            exchange: '',
            isin: '',
            interestRatePercent: 7.5,
            maturityDate: '2024-11-20',
            maturityAmount: 107500,
            amfiCode: '',
            notes: 'Emergency fund'
        }
    ];

    override getSummary(): Observable<PortfolioSummary> {
        return of({
            totalNetWorth: 389500,
            totalInvested: 349000,
            totalGainLoss: 40500,
            totalGainLossPercent: 11.6,
            xirrPercent: 14.8,
            allocationByType: { 'STOCK': 29500, 'MUTUAL_FUND': 260000, 'FD': 100000 },
            allocationBySector: { 'Energy': 29500, 'Diversified': 260000, 'Banking': 100000 },
            topHoldings: this.mockHoldings.slice(0, 5)
        }).pipe(delay(500));
    }

    override getAllHoldings(): Observable<AssetDto[]> {
        return of(this.mockHoldings).pipe(delay(400));
    }

    override createHolding(req: HoldingRequest): Observable<AssetDto> {
        const newHolding: AssetDto = {
            ...req,
            id: Math.max(...this.mockHoldings.map(h => h.id)) + 1,
            currentPrice: req.purchasePrice,
            currentValue: (req.quantity || 1) * req.purchasePrice,
            investedValue: (req.quantity || 1) * req.purchasePrice,
            gainLoss: 0,
            gainLossPercent: 0,
            assetType: req.assetType || 'STOCK',
            symbol: req.symbol || '',
            name: req.name || '',
            quantity: req.quantity || 0,
            purchasePrice: req.purchasePrice || 0,
            purchaseDate: req.purchaseDate || '',
            sector: req.sector || '',
            exchange: req.exchange || '',
            isin: req.isin || '',
            interestRatePercent: req.interestRatePercent || 0,
            maturityDate: req.maturityDate || '',
            maturityAmount: req.maturityAmount || 0,
            amfiCode: req.amfiCode || '',
            notes: req.notes || ''
        };
        this.mockHoldings = [...this.mockHoldings, newHolding];
        return of(newHolding).pipe(delay(600));
    }

    override analyzeStock(ticker: string): Observable<RecommendationDto> {
        return of({
            ticker,
            action: 'BUY',
            reasoning: `Technical indicators for ${ticker} show a strong upward momentum with RSI at 55 and moving averages providing support. Market sentiment is positive.`,
            riskLevel: 'MEDIUM',
            confidenceScore: 0.85,
            generatedAt: new Date().toISOString()
        }).pipe(delay(1500));
    }

    override chat(message: string): Observable<{ response: string }> {
        return of({
            response: `I've analyzed your portfolio. You have a high concentration in Mutual Funds (67%). You might want to diversify into more Equities or suggest some Gold ETFs for hedging. Also, your SBI FD is maturing soon.`
        }).pipe(delay(1000));
    }

    override login(username: string, password: string): Observable<{ token: string }> {
        if (username === 'admin' && password === 'changeme') {
            return of({ token: 'mock-jwt-token' }).pipe(delay(500));
        }
        // Return 401 equivalent
        throw { status: 401, message: 'Invalid credentials' };
    }
}
