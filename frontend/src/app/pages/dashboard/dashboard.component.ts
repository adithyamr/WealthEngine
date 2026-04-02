import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NetWorthComponent } from '../../components/net-worth/net-worth.component';
import { LiveConsoleComponent } from '../../components/live-console/live-console.component';
import { DailyRecsComponent } from '../../components/daily-recs/daily-recs.component';
import { loadPortfolio } from '../../store/portfolio/portfolio.actions';
import { selectSummary, selectLoading } from '../../store/portfolio/portfolio.selectors';
import { PortfolioSummary } from '../../core/services/portfolio.service';

@Component({
    selector: 'we-dashboard',
    standalone: true,
    imports: [CommonModule, NetWorthComponent, LiveConsoleComponent, DailyRecsComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-white">Portfolio Dashboard</h1>
          <p class="text-gray-400 text-sm">Good morning, Investor 🌅</p>
        </div>
        <button (click)="refresh()"
                class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors flex items-center gap-2">
          <span [class]="(loading$ | async) ? 'animate-spin' : ''">↻</span>
          Refresh
        </button>
      </div>

      <!-- KPI Strip -->
      <div *ngIf="summary$ | async as summary" class="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up">
        <div class="bg-wealth-card rounded-xl p-4 border border-gray-800">
          <p class="text-xs text-gray-500 mb-1">Net Worth</p>
          <p class="text-xl font-bold text-white">₹{{ summary.totalNetWorth | number:'1.0-0' }}</p>
        </div>
        <div class="bg-wealth-card rounded-xl p-4 border border-gray-800">
          <p class="text-xs text-gray-500 mb-1">Total Invested</p>
          <p class="text-xl font-bold text-white">₹{{ summary.totalInvested | number:'1.0-0' }}</p>
        </div>
        <div class="bg-wealth-card rounded-xl p-4 border border-gray-800">
          <p class="text-xs text-gray-500 mb-1">Gain / Loss</p>
          <p class="text-xl font-bold"
             [class]="summary.totalGainLoss >= 0 ? 'text-wealth-green' : 'text-wealth-red'">
            {{ summary.totalGainLoss >= 0 ? '+' : '' }}₹{{ summary.totalGainLoss | number:'1.0-0' }}
          </p>
        </div>
        <div class="bg-wealth-card rounded-xl p-4 border border-gray-800">
          <p class="text-xs text-gray-500 mb-1">XIRR (p.a.)</p>
          <p class="text-xl font-bold"
             [class]="summary.xirrPercent >= 0 ? 'text-wealth-green' : 'text-wealth-red'">
            {{ summary.xirrPercent | number:'1.2-2' }}%
          </p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Treemap - large -->
        <div class="xl:col-span-2">
          <we-net-worth *ngIf="summary$ | async as summary"
            [allocationByType]="summary.allocationByType"
            [totalNetWorth]="summary.totalNetWorth"
            [gainLossPercent]="summary.totalGainLossPercent">
          </we-net-worth>
        </div>
        <!-- Daily AI picks -->
        <div class="xl:col-span-1">
          <we-daily-recs [recommendations]="recommendations"></we-daily-recs>
        </div>
      </div>

      <!-- Live Console full width -->
      <we-live-console></we-live-console>
    </div>
  `
})
export class DashboardComponent implements OnInit {
    summary$: Observable<PortfolioSummary | null>;
    loading$: Observable<boolean>;
    recommendations: any[] = [];

    constructor(private store: Store) {
        this.summary$ = this.store.select(selectSummary);
        this.loading$ = this.store.select(selectLoading);
    }

    ngOnInit(): void {
        this.store.dispatch(loadPortfolio());
        // Collect recommendations from agent state
        this.store.select((s: any) => s.agent.recommendation).subscribe((rec: any) => {
            if (rec && !this.recommendations.find(r => r.ticker === rec.ticker)) {
                this.recommendations = [rec, ...this.recommendations].slice(0, 10);
            }
        });
    }

    refresh(): void {
        this.store.dispatch(loadPortfolio());
    }
}
