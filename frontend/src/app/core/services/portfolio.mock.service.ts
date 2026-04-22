import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { PortfolioService, AssetDto, PortfolioSummary, HoldingRequest, RecommendationDto } from './portfolio.service';

@Injectable({ providedIn: 'root' })
export class MockPortfolioService extends PortfolioService {
    private mockHoldings: AssetDto[] = [
        {
            id: 1, assetType: 'STOCK', symbol: 'RELIANCE', name: 'Reliance Industries',
            quantity: 10, purchasePrice: 2400, currentPrice: 2950, purchaseDate: '2022-03-01',
            currentValue: 29500, investedValue: 24000,
            gainLoss: 5500, gainLossPercent: 22.92,
            gainLossPostTax: 4150, gainLossPostTaxPercent: 16.35,
            ltcgEligible: true,
            sector: 'Energy', exchange: 'NSE', isin: 'INE002A01018',
            interestRatePercent: 0, maturityDate: '', maturityAmount: 0, amfiCode: '', notes: 'Flagship stock'
        },
        {
            id: 2, assetType: 'MUTUAL_FUND', symbol: 'HDFC_TOP_100', name: 'HDFC Top 100 Fund',
            quantity: 500, purchasePrice: 450, currentPrice: 520, purchaseDate: '2022-06-10',
            currentValue: 260000, investedValue: 225000,
            gainLoss: 35000, gainLossPercent: 15.56,
            gainLossPostTax: 22800, gainLossPostTaxPercent: 10.42,
            ltcgEligible: false,
            sector: 'Diversified', exchange: '', isin: '', interestRatePercent: 0,
            maturityDate: '', maturityAmount: 0, amfiCode: '100033', notes: 'SIP'
        },
        {
            id: 3, assetType: 'FD', symbol: 'SBI_FD_2024', name: 'SBI Fixed Deposit',
            quantity: 1, purchasePrice: 100000, currentPrice: 100000, purchaseDate: '2023-11-20',
            currentValue: 100000, investedValue: 100000,
            gainLoss: 7500, gainLossPercent: 7.5,
            gainLossPostTax: 7500, gainLossPostTaxPercent: 7.5,
            ltcgEligible: false,
            sector: 'Banking', exchange: '', isin: '', interestRatePercent: 7.5,
            maturityDate: '2024-11-20', maturityAmount: 107500, amfiCode: '', notes: 'Emergency fund'
        },
        {
            id: 4, assetType: 'ETF', symbol: 'NIFTY50ETF', name: 'NIFTY 50 ETF',
            quantity: 100, purchasePrice: 100, currentPrice: 100, purchaseDate: '2024-01-10',
            currentValue: 10000, investedValue: 10000,
            gainLoss: 0, gainLossPercent: 0,
            gainLossPostTax: 0, gainLossPostTaxPercent: 0,
            ltcgEligible: true,
            sector: 'Index', exchange: 'NSE', isin: '', interestRatePercent: 0,
            maturityDate: '', maturityAmount: 0, amfiCode: '', notes: 'Long term index holding'
        }
    ];

    override getSummary(): Observable<PortfolioSummary> {
        return of({
            totalNetWorth: 389500,
            totalInvested: 349000,
            totalGainLoss: 40500,
            totalGainLossPercent: 11.60,
            totalGainLossPostTax: 35200,
            totalGainLossPostTaxPercent: 8.12,
            xirrPercent: 14.80,
            allocationByType: {
                'MUTUAL_FUND': 253175,
                'STOCK': 77900,
                'FD': 38950,
                'ETF': 19475
            },
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
            gainLoss: 0, gainLossPercent: 0,
            gainLossPostTax: 0, gainLossPostTaxPercent: 0,
            ltcgEligible: false,
            assetType: req.assetType || 'STOCK', symbol: req.symbol || '',
            name: req.name || '', quantity: req.quantity || 0,
            purchasePrice: req.purchasePrice || 0, purchaseDate: req.purchaseDate || '',
            sector: req.sector || '', exchange: req.exchange || '', isin: req.isin || '',
            interestRatePercent: req.interestRatePercent || 0, maturityDate: req.maturityDate || '',
            maturityAmount: req.maturityAmount || 0, amfiCode: req.amfiCode || '', notes: req.notes || ''
        };
        this.mockHoldings = [...this.mockHoldings, newHolding];
        return of(newHolding).pipe(delay(600));
    }

    override analyzeStock(ticker: string): Observable<RecommendationDto> {
        return of({
            ticker, action: 'BUY',
            reasoning: `Technical indicators for ${ticker} show strong upward momentum. RSI at 55, MACD bullish crossover, and moving averages providing support. Market sentiment is positive.`,
            riskLevel: 'MEDIUM', confidenceScore: 0.85, generatedAt: new Date().toISOString()
        }).pipe(delay(1500));
    }

    override chat(message: string): Observable<{ response: string }> {
        const responses: Record<string, string> = {
            'risk': `Your portfolio risk score is 6.5/10 (Moderate-High). Major risk factors: 67% in equities, overweight in Reliance Industries (8.2% vs recommended 5%). Consider rebalancing by reducing equity exposure and adding more debt instruments.`,
            'invest': `Based on your current portfolio, I recommend: 1) Add ₹20,000 to NIFTY 50 index funds for diversification. 2) Consider HDFC Bank or ICICI Bank which show strong momentum. 3) Your SBI FD matures soon — reinvest in a higher-yield instrument.`,
            'sell': `Reliance Industries is currently overweight at 22.9% returns. While the momentum is strong, consider trimming 10-15% of your position to rebalance and take profits. Target sell zone: ₹3,100–₹3,200.`,
            'default': `I've analyzed your portfolio of ₹3,89,500. You have strong diversification across Mutual Funds (65%), Stocks (20%), FD (10%) and ETFs (5%). Overall XIRR at 14.8% is excellent. Key insight: your SBI FD matures in Nov 2024 — plan reinvestment now.`
        };
        const lower = message.toLowerCase();
        const key = lower.includes('risk') ? 'risk' : lower.includes('invest') ? 'invest' : lower.includes('sell') || lower.includes('reliance') ? 'sell' : 'default';
        return of({ response: responses[key] }).pipe(delay(1200));
    }

    override login(username: string, password: string): Observable<{ token: string }> {
        if (username === 'admin' && password === 'changeme') {
            return of({ token: 'mock-jwt-token-xyz' }).pipe(delay(500));
        }
        return throwError(() => ({ status: 401, message: 'Invalid credentials' }));
    }
}
