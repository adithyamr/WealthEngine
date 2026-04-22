import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadPortfolio } from '../../store/portfolio/portfolio.actions';
import { selectSummary, selectLoading } from '../../store/portfolio/portfolio.selectors';
import { PortfolioSummary, PortfolioService, AssetDto } from '../../core/services/portfolio.service';

function sparkPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return '';
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`);
  return `M ${pts.join(' L ')}`;
}

const SP_NW = [370000, 362000, 375000, 371000, 378000, 381000, 389500];
const SP_GAIN = [25000, 22000, 30000, 33000, 38000, 37000, 40500];
const SP_XIRR = [10, 10.5, 12, 13, 14, 14.5, 14.8];

@Component({
  selector: 'we-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="px-5 py-4 space-y-3 min-h-full">

      <!-- ── Header ──────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">👋 Good {{ greeting }}, {{ displayUsername }}!</h1>
          <p class="text-gray-500 text-xs">Here's your portfolio overview</p>
        </div>
        <div class="flex items-center gap-2.5">
          <!-- Bell -->
          <button class="relative w-8 h-8 rounded-xl bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          </button>
          <!-- User avatar + dropdown -->
          <div class="relative">
            <button (click)="showUserMenu=!showUserMenu"
              class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white hover:ring-2 hover:ring-indigo-500/50 transition-all">
              {{ userInitialDash }}
            </button>
            <div *ngIf="showUserMenu"
              class="absolute right-0 top-10 w-48 bg-[#0d1120] border border-gray-700/60 rounded-xl shadow-xl z-50 overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-800/60">
                <p class="text-xs font-bold text-white">{{ displayUsername }}</p>
                <p class="text-[10px] text-gray-500">Investor · WealthEngine</p>
              </div>
              <button (click)="logoutDash()"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] text-red-400 hover:bg-red-900/20 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TOP ROW: KPI 2x2 | Portfolio Growth | Allocation ─────────── -->
      <div *ngIf="summary$ | async as s" class="grid grid-cols-11 gap-3">

        <!-- KPI 2x2 panel (4 cols) -->
        <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl grid grid-cols-2 divide-x divide-y divide-gray-800/60">
          <!-- Net Worth -->
          <div class="p-4">
            <p class="text-[10px] text-gray-500 font-medium flex items-center gap-1 mb-1">Net Worth
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </p>
            <p class="text-xl font-extrabold text-white leading-none">₹{{ s.totalNetWorth | number:'1.0-0' }}</p>
            <p class="text-[10px] text-wealth-green font-semibold mt-1">▲ ₹{{ s.totalGainLoss | number:'1.0-0' }} ({{ s.totalGainLossPercent | number:'1.2-2' }}%)</p>
          </div>
          <!-- Gain / Loss -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-1">
              <p class="text-[10px] text-gray-500 font-medium">Gain / Loss (Post-Tax)
                <svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </p>
            </div>
            <p class="text-xl font-extrabold leading-none" [class.text-wealth-green]="s.totalGainLossPostTax>=0" [class.text-wealth-red]="s.totalGainLossPostTax<0">
              {{ s.totalGainLossPostTax >= 0 ? '+' : '' }}₹{{ s.totalGainLossPostTax | number:'1.0-0' }}
            </p>
            <p class="text-[10px] text-wealth-green font-semibold mt-1">▲ {{ s.totalGainLossPostTaxPercent | number:'1.2-2' }}%</p>
          </div>
          <!-- Total Invested -->
          <div class="p-4">
            <p class="text-[10px] text-gray-500 font-medium mb-1">Total Invested
              <svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </p>
            <p class="text-xl font-extrabold text-white leading-none">₹{{ s.totalInvested | number:'1.0-0' }}</p>
            <p class="text-[10px] text-gray-600 mt-1">--</p>
          </div>
          <!-- XIRR -->
          <div class="p-4">
            <p class="text-[10px] text-gray-500 font-medium mb-1">XIRR (p.a.)</p>
            <p class="text-xl font-extrabold text-wealth-green leading-none">{{ s.xirrPercent | number:'1.2-2' }}%</p>
            <p class="text-[10px] text-wealth-green font-semibold mt-1">Good Performance</p>
          </div>
        </div>

        <!-- Portfolio Growth chart (4 cols) -->
        <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white">Portfolio Growth</h3>
            <div class="flex gap-0.5">
              <button *ngFor="let r of growthRanges" (click)="growthRange=r"
                [class]="growthRange===r ? 'px-2 py-0.5 rounded-lg text-[9px] font-bold bg-indigo-500 text-white' : 'px-2 py-0.5 rounded-lg text-[9px] font-medium text-gray-500 hover:text-gray-300 transition-colors'">
                {{ r }}
              </button>
            </div>
          </div>
          <!-- Line Chart SVG -->
          <svg viewBox="0 0 300 100" class="w-full h-24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path d="M 0,85 Q 30,80 50,75 Q 70,70 90,65 Q 110,55 130,50 Q 150,45 170,40 Q 190,30 210,28 Q 230,20 250,15 L 300,5"
              fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
            <path d="M 0,85 Q 30,80 50,75 Q 70,70 90,65 Q 110,55 130,50 Q 150,45 170,40 Q 190,30 210,28 Q 230,20 250,15 L 300,5 L 300,100 L 0,100 Z"
              fill="url(#growthGrad)"/>
          </svg>
          <!-- X-axis labels -->
          <div class="flex justify-between text-[8px] text-gray-600 mt-1">
            <span>1 May</span><span>8 May</span><span>15 May</span><span>22 May</span><span>31 May</span>
          </div>
        </div>

        <!-- Portfolio Allocation (3 cols) -->
        <div class="col-span-3 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <h3 class="text-sm font-bold text-white mb-3">Portfolio Allocation</h3>
          <div class="flex items-center gap-3">
            <!-- Donut -->
            <div class="relative flex-shrink-0">
              <svg viewBox="0 0 100 100" class="w-24 h-24" style="transform:rotate(-90deg)">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1f2937" stroke-width="16"/>
                <ng-container *ngFor="let seg of buildDonut(s.allocationByType)">
                  <circle cx="50" cy="50" r="38" fill="none" [attr.stroke]="seg.color" stroke-width="16"
                    [attr.stroke-dasharray]="seg.dash" [attr.stroke-dashoffset]="seg.offset"/>
                </ng-container>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <p class="text-[10px] font-extrabold text-white leading-tight">₹{{ s.totalNetWorth | number:'1.0-0' }}</p>
                <p class="text-[8px] text-gray-500">Total Value</p>
              </div>
            </div>
            <!-- Legend -->
            <div class="flex-1 space-y-1.5">
              <ng-container *ngFor="let seg of buildDonut(s.allocationByType)">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <div class="w-2 h-2 rounded-full flex-shrink-0" [style.background]="seg.color"></div>
                    <span class="text-[9px] text-gray-400">{{ seg.label }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[9px] font-semibold text-white">{{ seg.pct | number:'1.0-0' }}%</span>
                    <span class="text-[8px] text-gray-600 ml-1">₹{{ seg.value | number:'1.0-0' }}</span>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
          <a routerLink="/holdings" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold block mt-3">View full allocation →</a>
        </div>
      </div>

      <!-- ── MIDDLE ROW: Goals | Holdings | Insights ───────────────────── -->
      <div class="grid grid-cols-3 gap-3">

        <!-- Goals -->
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white">Goals</h3>
            <a routerLink="/goals" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all →</a>
          </div>
          <div class="space-y-3">
            <div *ngFor="let g of dashGoals" class="flex items-start gap-2.5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" [ngClass]="g.iconBg">{{ g.icon }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                  <p class="text-[10px] font-semibold text-white truncate">{{ g.name }}</p>
                  <span class="text-[9px] font-semibold text-gray-400 ml-2 flex-shrink-0">{{ g.pct }}%</span>
                </div>
                <p class="text-[9px] text-gray-500 mb-1">Expected: {{ g.expectedDate }} • ₹{{ g.current | number:'1.0-0' }} / ₹{{ g.target | number:'1.0-0' }}</p>
                <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" [ngClass]="g.color" [style.width.%]="g.pct"></div>
                </div>
                <p class="text-[9px] text-gray-600 mt-0.5 text-right">{{ g.daysLeft }} days to go</p>
              </div>
            </div>
          </div>
          <button class="w-full mt-3 py-1.5 border border-dashed border-gray-700 rounded-xl text-[10px] text-gray-500 hover:text-indigo-400 hover:border-indigo-700/50 transition-colors">
            + Add Goal
          </button>
        </div>

        <!-- Holdings mini-table -->
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white">Holdings</h3>
            <a routerLink="/holdings" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all holdings →</a>
          </div>
          <!-- Table header -->
          <div class="grid mid-hold-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-1 pb-2 border-b border-gray-800/60">
            <div>Asset</div><div class="text-right">Current Value</div>
            <div class="text-right">Gain/Loss (Post-Tax)</div><div class="text-right">Return (%)</div>
          </div>
          <!-- Rows -->
          <div class="space-y-0.5 mt-1">
            <div *ngFor="let h of filteredHoldings" class="grid mid-hold-grid px-1 py-2 rounded-xl hover:bg-gray-800/30 transition-colors items-center">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[8px] font-bold text-gray-300 flex-shrink-0">
                  {{ (h.symbol || h.name)?.substring(0,3)?.toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-semibold text-white truncate">{{ h.name }}</p>
                  <div class="flex items-center gap-1">
                    <span *ngIf="h.ltcgEligible" class="text-[7px] font-bold px-1 py-0 rounded bg-emerald-900/50 text-emerald-400">LTCG</span>
                    <span class="text-[8px] font-bold px-1 py-0 rounded" [ngClass]="getTypeBadge(h.assetType)">{{ h.assetType.replace('_',' ') }}</span>
                  </div>
                  <p class="text-[8px] text-gray-500 truncate">{{ h.exchange || 'NSE' }} • {{ h.sector || h.symbol }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-semibold text-white">₹{{ (h.currentValue || h.investedValue) | number:'1.0-0' }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-semibold" [class.text-wealth-green]="(h.gainLossPostTax||0)>=0" [class.text-wealth-red]="(h.gainLossPostTax||0)<0">
                  {{ (h.gainLossPostTax||0)>=0?'+':'' }}₹{{ (h.gainLossPostTax||0) | number:'1.0-0' }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-[10px] font-bold" [class.text-wealth-green]="(h.gainLossPercent||0)>=0" [class.text-wealth-red]="(h.gainLossPercent||0)<0">
                  {{ (h.gainLossPercent||0)>=0?'+':'' }}{{ (h.gainLossPercent||0) | number:'1.2-2' }}%
                </p>
              </div>
            </div>
          </div>
          <div class="text-center pt-2 border-t border-gray-800/60 mt-2">
            <a routerLink="/holdings" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all holdings →</a>
          </div>
        </div>

        <!-- Insights -->
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white">Insights</h3>
            <a routerLink="/analysis" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all insights →</a>
          </div>
          <div class="space-y-2.5">
            <div *ngFor="let ins of insights" class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-800/40 transition-colors cursor-pointer group">
              <div [ngClass]="ins.iconBg" class="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0">{{ ins.icon }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-semibold text-white">{{ ins.title }}</p>
                <p class="text-[9px] text-gray-500">{{ ins.desc }}</p>
              </div>
              <svg class="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ── BOTTOM ROW: Watchlist | AI Picks | Ask AI ─────────────────── -->
      <div class="grid grid-cols-3 gap-3">

        <!-- Watchlist -->
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white">Watchlist</h3>
            <a routerLink="/watchlist" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all →</a>
          </div>
          <!-- Header -->
          <div class="grid watchlist-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-1 pb-1.5 border-b border-gray-800/60">
            <div>Name</div><div class="text-right">Price</div><div class="text-right">Change</div>
            <div class="text-center">1D Trend</div><div>Notes</div>
          </div>
          <div class="space-y-0 mt-1">
            <div *ngFor="let w of watchlistItems" class="grid watchlist-grid px-1 py-2 rounded-xl hover:bg-gray-800/30 transition-colors items-center">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-bold flex-shrink-0" [ngClass]="w.iconBg">{{ w.icon }}</div>
                <span class="text-[10px] font-semibold text-white truncate">{{ w.name }}</span>
              </div>
              <div class="text-right text-[10px] font-semibold text-white">₹{{ w.price | number:'1.2-2' }}</div>
              <div class="text-right text-[10px] font-bold" [class.text-wealth-green]="w.change>=0" [class.text-wealth-red]="w.change<0">
                {{ w.change>=0?'+':'' }}{{ w.change | number:'1.2-2' }}%
              </div>
              <div class="flex justify-center">
                <svg viewBox="0 0 40 16" class="w-10 h-4">
                  <path [attr.d]="w.trend" fill="none" [attr.stroke]="w.change>=0?'#10b981':'#ef4444'" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="text-[9px] text-gray-500 truncate">{{ w.note }}</div>
            </div>
          </div>
          <button class="w-full mt-2 py-1.5 border border-dashed border-gray-700 rounded-xl text-[10px] text-gray-500 hover:text-indigo-400 hover:border-indigo-700/50 transition-colors">+ Add to Watchlist</button>
        </div>

        <!-- AI Top Picks -->
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-white">AI Top Picks</h3>
            <a routerLink="/analysis" class="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all →</a>
          </div>
          <!-- Tabs -->
          <div class="flex gap-1.5 mb-3">
            <button *ngFor="let t of pickTabs" (click)="activePick=t"
              [class]="activePick===t ? 'px-2 py-1 rounded-lg text-[9px] font-semibold bg-indigo-500 text-white' : 'px-2 py-1 rounded-lg text-[9px] font-medium bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors'">
              {{ t }}
            </button>
          </div>
          <!-- Picks list -->
          <div class="space-y-2">
            <div *ngFor="let p of topPicks; let i=index" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-800/40 transition-colors cursor-pointer">
              <div class="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[9px] font-extrabold text-gray-300 flex-shrink-0">{{ i+1 }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-semibold text-white">{{ p.name }}</p>
                <p class="text-[9px] text-gray-500 truncate">{{ p.reason }}</p>
              </div>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                [ngClass]="p.risk==='High'?'bg-green-900/50 text-green-400 border border-green-800/40':'bg-amber-900/50 text-amber-400 border border-amber-800/40'">
                ● {{ p.risk }}
              </span>
            </div>
          </div>
          <p class="text-[9px] text-gray-700 text-center mt-3 border-t border-gray-800/60 pt-2">AI picks are for informational purposes only.</p>
        </div>

        <!-- Ask WealthEngine AI -->
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-indigo-400">✦</span>
            <h3 class="text-xs font-bold text-white">Ask WealthEngine AI</h3>
            <a routerLink="/analysis" class="ml-auto text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold">View all →</a>
          </div>
          <p class="text-[10px] text-gray-500 mb-3">Get answers, insights and recommendations</p>
          <div class="flex gap-1.5 flex-wrap mb-3">
            <button *ngFor="let q of quickQ" (click)="chatInput = q"
              class="px-2 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-[9px] text-gray-400 hover:text-white transition-all border border-gray-700/60">
              {{ q }}
            </button>
          </div>
          <div class="flex gap-2 mt-auto">
            <input [(ngModel)]="chatInput" (keydown.enter)="sendChat()"
              placeholder="Type your question..."
              class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-[10px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500">
            <button (click)="sendChat()" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              Ask AI
            </button>
          </div>
          <div *ngIf="chatResponse" class="mt-2 p-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-[10px] text-gray-300 leading-relaxed">
            🤖 {{ chatResponse }}
          </div>
          <p class="text-[9px] text-gray-700 text-center mt-2">AI responses are for informational purposes only.</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    .mid-hold-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr 0.8fr;
      align-items: center;
      column-gap: 8px;
    }
    .watchlist-grid {
      display: grid;
      grid-template-columns: 1.8fr 1fr 0.8fr 0.8fr 1.5fr;
      align-items: center;
      column-gap: 6px;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  summary$: Observable<PortfolioSummary | null>;
  loading$: Observable<boolean>;
  holdings: AssetDto[] = [];
  searchTerm = '';
  activeFilter = 'All';
  showPostTax = false;
  chatInput = '';
  chatResponse = '';
  showUserMenu = false;
  growthRange = '1M';
  activePick = 'All Picks';
  private destroyed$ = new Subject<void>();

  growthRanges = ['7D', '1M', '3M', '6M', '1Y', 'ALL'];
  pickTabs = ['All Picks', 'Undervalued', 'Breakout', 'Long Term'];

  get displayUsername(): string {
    const stored = localStorage.getItem('we_username');
    if (!stored) return 'there';
    return stored.charAt(0).toUpperCase() + stored.slice(1);
  }

  get userInitialDash(): string {
    const stored = localStorage.getItem('we_username');
    return stored ? stored.charAt(0).toUpperCase() : 'U';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  filters = ['All', 'Stocks', 'Mutual Funds', 'FD', 'ETFs'];

  sp = {
    nw: sparkPath(SP_NW, 100, 28),
    gain: sparkPath(SP_GAIN, 100, 28),
    xirr: sparkPath(SP_XIRR, 100, 28),
  };

  insights = [
    { icon: '📈', iconBg: 'bg-green-900/40', title: 'Add ₹20K to Index Funds', desc: 'Index funds are undervalued' },
    { icon: '⚠️', iconBg: 'bg-amber-900/40', title: 'Reduce Reliance exposure', desc: 'Overweight by 8.2%' },
    { icon: '🔔', iconBg: 'bg-red-900/40', title: 'High small-cap allocation', desc: 'Consider rebalancing' },
  ];

  topPicks = [
    { icon: '🏦', bg: 'bg-blue-900/40', name: 'ICICI Bank', reason: 'Strong breakout above resistance', risk: 'High' },
    { icon: '🏗️', bg: 'bg-green-900/40', name: 'Larsen & Toubro', reason: 'Infra growth + strong order book', risk: 'High' },
    { icon: '🛡️', bg: 'bg-purple-900/40', name: 'HDFC Life', reason: 'Undervalued, long term potential', risk: 'Medium' },
  ];

  watchlistItems = [
    { icon: '🏦', iconBg: 'bg-blue-900/50 text-blue-300', name: 'ICICI Bank', price: 1253.30, change: 1.35, note: 'Strong breakout', trend: 'M 0,12 Q 8,8 16,10 Q 24,4 32,6 L 40,2' },
    { icon: '🏗️', iconBg: 'bg-green-900/50 text-green-300', name: 'Larsen & Toubro', price: 3542.40, change: 0.82, note: 'Infra momentum', trend: 'M 0,10 Q 8,12 16,8 Q 24,6 32,4 L 40,2' },
    { icon: '🚗', iconBg: 'bg-yellow-900/50 text-yellow-300', name: 'Tata Motors', price: 1045.30, change: -0.45, note: 'Weak near term', trend: 'M 0,4 Q 8,6 16,8 Q 24,10 32,12 L 40,14' },
    { icon: '🛡️', iconBg: 'bg-purple-900/50 text-purple-300', name: 'HDFC Life', price: 678.50, change: 0.22, note: 'Long term pick', trend: 'M 0,8 Q 8,6 16,8 Q 24,6 32,4 L 40,3' },
    { icon: '🎨', iconBg: 'bg-orange-900/50 text-orange-300', name: 'Asian Paints', price: 2580.10, change: -0.15, note: 'Watch support', trend: 'M 0,4 Q 8,6 16,8 Q 24,10 32,12 L 40,13' },
  ];

  quickQ = ['What should I invest this month?', 'Analyze my portfolio risk', 'Should I sell Reliance?', 'Best stocks for next 6 months'];

  dashGoals = [
    { icon: '🏠', iconBg: 'bg-red-900/40', name: 'Loan Repayment', expectedDate: "Mar '26", current: 50000, target: 100000, pct: 50, color: 'bg-indigo-500', daysLeft: 224 },
    { icon: '🛡️', iconBg: 'bg-amber-900/40', name: 'Emergency Fund', expectedDate: "Dec '25", current: 100000, target: 200000, pct: 50, color: 'bg-wealth-green', daysLeft: 209 },
    { icon: '✈️', iconBg: 'bg-green-900/40', name: 'Europe Vacation', expectedDate: "Feb '26", current: 80000, target: 100000, pct: 80, color: 'bg-amber-500', daysLeft: 270 },
  ];

  private donutColors = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6'];
  private donutLabels: Record<string, string> = { STOCK: 'Stocks', MUTUAL_FUND: 'Mutual Funds', FD: 'Fixed Deposits', ETF: 'ETFs', GOLD: 'Gold' };

  constructor(private store: Store, private portfolioService: PortfolioService, private router: Router) {
    this.summary$ = this.store.select(selectSummary);
    this.loading$ = this.store.select(selectLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadPortfolio());
    this.portfolioService.getAllHoldings().pipe(takeUntil(this.destroyed$)).subscribe(h => this.holdings = h);
  }

  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }

  logoutDash(): void {
    this.showUserMenu = false;
    localStorage.removeItem('we_username');
    localStorage.removeItem('we_token');
    this.router.navigate(['/login']);
  }

  gainLossVal(s: PortfolioSummary) { return this.showPostTax ? s.totalGainLossPostTax : s.totalGainLoss; }
  gainLossPctVal(s: PortfolioSummary) { return this.showPostTax ? s.totalGainLossPostTaxPercent : s.totalGainLossPercent; }

  get filteredHoldings() {
    return this.holdings.filter(h =>
      !this.searchTerm || h.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || (h.symbol || '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  buildDonut(alloc: Record<string, number> | null | undefined) {
    if (!alloc) return [];
    const entries = Object.entries(alloc);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    const circ = 2 * Math.PI * 38;
    let offset = 0;
    return entries.map(([k, v], i) => {
      const pct = v / total;
      const seg = { label: this.donutLabels[k] || k, color: this.donutColors[i % this.donutColors.length], pct: pct * 100, value: v, dash: `${pct * circ} ${circ} `, offset: -offset * circ };
      offset += pct;
      return seg;
    });
  }

  getTypeBadge(type: string): string {
    return ({ STOCK: 'bg-blue-900/40 text-blue-300', MUTUAL_FUND: 'bg-purple-900/40 text-purple-300', ETF: 'bg-green-900/40 text-green-300', FD: 'bg-amber-900/40 text-amber-300' } as any)[type] || 'bg-gray-800 text-gray-400';
  }

  sendChat(): void {
    if (!this.chatInput.trim()) return;
    const q = this.chatInput; this.chatInput = ''; this.chatResponse = '';
    this.portfolioService.chat(q).subscribe(r => this.chatResponse = r.response);
  }
}
