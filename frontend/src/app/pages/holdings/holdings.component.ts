import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadHoldings, deleteHolding, setSelectedType } from '../../store/holdings/holdings.actions';
import { selectFilteredHoldings, selectHoldingsLoading, selectHoldingsByType, selectSelectedType } from '../../store/holdings/holdings.selectors';
import { AddHoldingFormComponent } from '../../components/add-holding-form/add-holding-form.component';
import { AssetDto } from '../../core/services/portfolio.service';

const ASSET_ICONS: Record<string, string> = { STOCK: '📈', MUTUAL_FUND: '🏦', ETF: '📊', FD: '🏛️', PPF: '💰', NPS: '🏛️', EPF: '💼', BONDS: '📜', GOLD: '🥇', CASH: '💵', CRYPTO: '🪙' };
const ASSET_LABELS: Record<string, string> = { STOCK: 'Stocks', MUTUAL_FUND: 'Mutual Funds', ETF: 'ETFs', FD: 'Fixed Deposits', PPF: 'PPF', NPS: 'NPS', EPF: 'EPF / PF', BONDS: 'Bonds', GOLD: 'Gold', CASH: 'Cash', CRYPTO: 'Crypto' };

@Component({
  selector: 'we-holdings',
  standalone: true,
  imports: [CommonModule, FormsModule, AddHoldingFormComponent],
  template: `
    <div class="px-5 py-4 space-y-4 min-h-full pb-20">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">Portfolio</h1>
          <p class="text-gray-500 text-xs">Your complete investment portfolio overview</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="showAddForm = true" class="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Holding
          </button>
          <button class="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-all border border-gray-700/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            Compare
          </button>
          <button class="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-all border border-gray-700/50">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1 border-b border-gray-800/60 h-10">
        <button *ngFor="let t of analysisTabs" (click)="activeAnalysisTab=t"
          [class]="activeAnalysisTab===t 
            ? 'px-4 h-full text-[11px] font-bold text-white border-b-2 border-indigo-500' 
            : 'px-4 h-full text-[11px] font-medium text-gray-500 hover:text-gray-300 transition-colors'">
          {{t}}
        </button>
      </div>

      <!-- ── Overview Tab ── -->
      <div *ngIf="activeAnalysisTab === 'Overview'" class="space-y-4 animate-in fade-in duration-500">
        
        <div class="grid grid-cols-12 gap-4">
          <!-- Portfolio Health Score -->
          <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 flex gap-6 items-center h-[160px]">
             <div class="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1c2136" stroke-width="8"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" stroke-width="8"
                    stroke-dasharray="197 263.8" stroke-linecap="round" class="transition-all duration-1000"/>
                </svg>
                <div class="absolute flex flex-col items-center">
                  <span class="text-2xl font-black text-white leading-none">7.5</span>
                  <span class="text-[10px] text-gray-500">/10</span>
                </div>
             </div>
             <div class="flex-1">
               <p class="text-[11px] font-bold text-gray-400 mb-1">Portfolio Health Score</p>
               <p class="text-lg font-black text-wealth-green mb-2">Good</p>
               <p class="text-[10px] text-gray-500 leading-relaxed max-w-[180px]">You're doing well! Keep focusing on diversification.</p>
               <button class="mt-3 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                 View details <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
               </button>
             </div>
          </div>

          <!-- Key Insights -->
          <div class="col-span-8 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 h-[160px] flex flex-col justify-between">
            <p class="text-[11px] font-bold text-gray-400">Key Insights</p>
            <div class="grid grid-cols-2 gap-y-3 gap-x-6 mt-2 flex-1">
              <div *ngFor="let ins of keyInsightsOverview" class="flex items-start gap-2.5">
                <div [class]="ins.color" class="w-2 h-2 rounded-full mt-1 flex-shrink-0"></div>
                <p class="text-[10px] text-gray-300 leading-snug">{{ins.text}}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="bg-[#0d1120]/50 border border-gray-800/60 rounded-2xl flex divide-x divide-gray-800/60 overflow-hidden">
          <div class="flex-1 px-5 py-3.5">
            <p class="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
            <div class="flex items-baseline gap-2">
              <p class="text-lg font-black text-white">₹3,89,500</p>
              <p class="text-[10px] font-bold text-wealth-green flex items-center gap-0.5">
                <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/></svg>
                ₹35,200 (11.60%)
              </p>
            </div>
          </div>
          <div class="flex-1 px-5 py-3.5">
            <p class="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total Invested</p>
            <p class="text-lg font-black text-white">₹3,49,000</p>
          </div>
          <div class="flex-1 px-5 py-3.5">
            <p class="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-1">Gain / Loss (Pre-Tax)</p>
            <div class="flex items-baseline gap-2">
              <p class="text-lg font-black text-white">₹35,200</p>
              <p class="text-[10px] font-bold text-wealth-green flex items-center gap-0.5">
                <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5H7z"/></svg>
                11.60%
              </p>
            </div>
          </div>
          <div class="flex-1 px-5 py-3.5">
            <p class="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-1">XIRR (p.a.)</p>
            <div>
              <p class="text-lg font-black text-white">14.80%</p>
              <p class="text-[10px] font-bold text-wealth-green">Good Performance</p>
            </div>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-5 gap-0 bg-[#0d1120]/30 border border-gray-800/60 rounded-2xl divide-x divide-gray-800/60">
           <div *ngFor="let m of overviewMetrics" class="px-5 py-3 flex flex-col justify-center">
             <p class="text-[9px] font-medium text-gray-500 uppercase tracking-wider mb-0.5">{{m.label}}</p>
             <p class="text-[11px] font-bold text-white flex items-center gap-2">
               {{m.value}}
               <span *ngIf="m.tag" class="text-[9px] px-1.5 py-0.5 rounded-full bg-wealth-green/20 text-wealth-green">{{m.tag}}</span>
             </p>
           </div>
        </div>

      </div>

      <!-- ── Risk Analysis Tab ── -->
      <div *ngIf="activeAnalysisTab === 'Risk Analysis'" class="space-y-4 animate-in">
        
        <div class="grid grid-cols-12 gap-4">
          <!-- Portfolio Risk Score -->
          <div class="col-span-3 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[180px]">
             <div class="relative w-24 h-24 flex items-center justify-center mb-3">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1c2136" stroke-width="8"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#eab308" stroke-width="8"
                    stroke-dasharray="147 263.8" stroke-linecap="round"/>
                </svg>
                <div class="absolute flex flex-col items-center">
                  <span class="text-2xl font-black text-white leading-none">5.6</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 mt-1">Moderate</span>
                </div>
             </div>
             <p class="text-[11px] font-bold text-gray-400">Portfolio Risk Score</p>
             <button class="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors mt-1">View risk questionnaire →</button>
          </div>

          <!-- Risk Level Gauge -->
          <div class="col-span-3 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[180px]">
            <p class="text-[11px] font-bold text-gray-400 mb-4">Risk Level</p>
            <div class="relative w-32 h-16 overflow-hidden">
               <svg viewBox="0 0 100 50" class="w-full h-full">
                 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1c2136" stroke-width="12" stroke-linecap="round"/>
                 <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#riskGrad)" stroke-width="12" stroke-linecap="round" stroke-dasharray="62.8 125.6"/>
               </svg>
               <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-10 bg-white origin-bottom rotate-[10deg] rounded-full"></div>
            </div>
            <p class="text-sm font-black text-white mt-2">Moderate</p>
            <p class="text-[9px] text-gray-500 mt-1">Risk score: 5.6/10</p>
          </div>

          <!-- Risk Breakdown -->
          <div class="col-span-3 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[180px]">
            <p class="text-[11px] font-bold text-gray-400 mb-3">Risk Breakdown</p>
            <div class="space-y-2.5">
              <div *ngFor="let b of riskBreakdown" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div [class]="b.color" class="w-1.5 h-1.5 rounded-full"></div>
                  <span class="text-[10px] text-gray-400">{{b.label}}</span>
                </div>
                <span class="text-[10px] font-bold text-white">{{b.pct}}%</span>
              </div>
            </div>
            <button class="mt-4 text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors">View detailed breakdown →</button>
          </div>

          <!-- Risk Summary KPIs -->
          <div class="col-span-3 grid grid-rows-3 gap-3 min-h-[180px]">
            <div class="bg-[#0d1120] border border-gray-800/60 rounded-xl p-3 flex flex-col justify-center">
              <p class="text-[9px] text-gray-500 uppercase">Expected Return (1Y)</p>
              <p class="text-sm font-black text-white">12.5% – 15.8%</p>
            </div>
            <div class="bg-[#0d1120] border border-gray-800/60 rounded-xl p-3 flex flex-col justify-center">
              <div class="flex items-center justify-between">
                <p class="text-[9px] text-gray-500 uppercase">Value at Risk (VaR)</p>
                <svg class="w-2.5 h-2.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p class="text-sm font-black text-white">₹18,450</p>
              <p class="text-[8px] text-gray-500 font-medium">95% confidence level</p>
            </div>
            <div class="bg-[#0d1120] border border-gray-800/60 rounded-xl p-3 flex flex-col justify-center">
               <p class="text-[9px] text-gray-500 uppercase">Max Drawdown / Beta</p>
               <p class="text-sm font-black text-white">-8.3% / 0.92</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <!-- Risk vs Return Container -->
          <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[320px]">
             <div class="flex items-center justify-between mb-3">
               <p class="text-[11px] font-bold text-gray-400">Risk vs Return</p>
               <svg class="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div class="relative w-full h-[220px] bg-gray-900/20 rounded-xl border border-gray-800/40 p-4">
                <div class="absolute inset-4 flex flex-col justify-between border-l border-b border-gray-800/60 text-[8px] text-gray-600">
                   <div *ngFor="let y of [20,15,10,5,0]" class="w-full flex items-center gap-2">
                     <span class="w-4 text-right">{{y}}%</span>
                     <div class="flex-1 border-t border-gray-800/30"></div>
                   </div>
                   <div class="absolute bottom-[-18px] left-0 w-full flex justify-between px-6">
                      <span *ngFor="let x of [0,5,10,15,20,25]">{{x}}%</span>
                   </div>
                   <div class="absolute bottom-[65%] left-[70%] w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] border border-white/20"></div>
                   <div class="absolute bottom-[45%] left-[35%] w-2.5 h-2.5 rounded-full bg-gray-600 border border-white/10"></div>
                </div>
                <div class="absolute top-2 right-3 text-[9px] font-bold text-wealth-green">Sharpe Ratio: 1.12</div>
             </div>
             <button class="mt-4 text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold">View full risk vs return analysis →</button>
          </div>

          <div class="col-span-8 grid grid-cols-2 gap-4 min-h-[320px]">
             <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 flex flex-col">
                <p class="text-[11px] font-bold text-gray-400 mb-3">Risk Metrics</p>
                <div class="space-y-1.5 flex-1 divide-y divide-gray-800/40">
                   <div *ngFor="let m of riskMetricsTable" class="flex items-center justify-between py-2">
                      <span class="text-[10px] text-gray-500 font-medium">{{m.label}}</span>
                      <div class="flex items-center gap-2">
                         <span class="text-[10px] font-bold text-white">{{m.value}}</span>
                         <span [class]="m.badgeCls" class="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">{{m.tag}}</span>
                      </div>
                   </div>
                </div>
                <button class="mt-3 text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold">View all risk metrics →</button>
             </div>
             
             <div class="flex flex-col gap-4">
               <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex-1">
                 <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] font-bold text-gray-400">Drawdown Analysis</p>
                    <svg class="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div class="h-[80px] w-full bg-gray-900/40 rounded-xl relative overflow-hidden border border-gray-800/40">
                    <svg viewBox="0 0 100 40" class="w-full h-full" preserveAspectRatio="none">
                       <path d="M 0 10 Q 20 8 40 15 Q 60 25 80 18 L 100 35 L 100 40 L 0 40 Z" fill="rgba(239, 68, 68, 0.15)"/>
                       <path d="M 0 10 Q 20 8 40 15 Q 60 25 80 18 L 100 35" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                 </div>
                 <div class="flex items-center justify-between mt-2.5">
                    <span class="text-[8px] text-gray-600 font-bold">13 Apr 2024</span>
                    <div class="flex flex-col items-center">
                       <span class="text-[11px] font-black text-wealth-red">-8.62%</span>
                       <span class="text-[7px] text-gray-600 uppercase font-medium">Max Drawdown</span>
                    </div>
                    <span class="text-[8px] text-gray-600 font-bold">25 Apr 2024</span>
                 </div>
               </div>
               <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex-1">
                 <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] font-bold text-gray-400">Risk Concentration</p>
                    <svg class="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div class="space-y-2.5">
                    <div *ngFor="let c of riskConcentration" class="flex items-center gap-2.5">
                       <div class="w-4 h-4 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-[8px] shadow-sm">{{c.icon}}</div>
                       <div class="flex-1">
                          <div class="flex justify-between mb-1">
                             <span class="text-[9px] text-gray-400 font-bold">{{c.name}}</span>
                             <span class="text-[9px] font-black text-white">{{c.pct}}%</span>
                          </div>
                          <div class="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                             <div class="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" [style.width.%]="c.pct * 5"></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <button class="mt-3 text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors font-bold">View concentration analysis →</button>
               </div>
             </div>
          </div>
        </div>

      </div>

      <!-- ── Sector Analysis Tab ── -->
      <div *ngIf="activeAnalysisTab === 'Sector Analysis'" class="space-y-4 animate-in">
        
        <!-- Sector KPIs -->
        <div class="grid grid-cols-4 gap-4">
           <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Top Sector Exposure</p>
              <p class="text-lg font-black text-white">Financial Services</p>
              <p class="text-[10px] font-bold text-wealth-green mt-1">32.4% of Portfolio</p>
           </div>
           <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Total Sectors</p>
              <p class="text-2xl font-black text-white">12</p>
              <p class="text-[10px] font-bold text-gray-400 mt-1">Diversified Portfolio</p>
           </div>
           <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Sector Concentration</p>
              <p class="text-lg font-black text-white">Moderate</p>
              <div class="w-24 h-1.5 bg-gray-800 mt-2 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500" style="width: 55%"></div>
              </div>
           </div>
           <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">Sector Change (1M)</p>
              <p class="text-xl font-black text-wealth-green">+4.25%</p>
              <p class="text-[10px] font-bold text-gray-400 mt-1">Top Gainer: IT</p>
           </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <!-- Sector Allocation Donut -->
          <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[340px] flex flex-col">
             <p class="text-[11px] font-bold text-gray-400 mb-4">Sector Allocation</p>
             <div class="relative flex-1 flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" class="w-40 h-40">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#1c2136" stroke-width="12"/>
                  <!-- Mock Slices -->
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#6366f1" stroke-width="12" stroke-dasharray="100 219.8"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="60 219.8" stroke-dashoffset="-100"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" stroke-width="12" stroke-dasharray="40 219.8" stroke-dashoffset="-160"/>
                </svg>
                <div class="absolute flex flex-col items-center">
                   <span class="text-[10px] text-gray-500 font-bold uppercase">Largest</span>
                   <span class="text-sm font-black text-white">Financials</span>
                </div>
             </div>
             <div class="grid grid-cols-2 gap-2 mt-4">
                <div *ngFor="let s of sectorSummary" class="flex items-center gap-2">
                   <div [class]="s.color" class="w-1.5 h-1.5 rounded-full"></div>
                   <span class="text-[9px] text-gray-400 font-medium truncate">{{s.label}}</span>
                   <span class="text-[9px] font-bold text-white ml-auto">{{s.pct}}%</span>
                </div>
             </div>
          </div>

          <!-- Sector Performance Table -->
          <div class="col-span-8 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[340px] flex flex-col">
             <div class="flex items-center justify-between mb-4">
               <p class="text-[11px] font-bold text-gray-400">Sector-wise Analysis</p>
               <button class="text-[9px] text-indigo-400 font-bold hover:underline">Compare with Benchmark →</button>
             </div>
             <div class="overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <table class="w-full text-left">
                  <thead class="text-[8px] text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th class="pb-3 px-2">Sector</th>
                      <th class="pb-3 text-right">Assets</th>
                      <th class="pb-3 text-right">Invested</th>
                      <th class="pb-3 text-right">Allocation</th>
                      <th class="pb-3 text-right">Returns (1M)</th>
                      <th class="pb-3 text-right">Industry Exposure</th>
                    </tr>
                  </thead>
                  <tbody class="text-[10px] font-bold divide-y divide-gray-800/30">
                    <tr *ngFor="let s of sectorAnalysisTable" class="hover:bg-gray-800/20 transition-colors">
                      <td class="py-3 px-2 flex items-center gap-2">
                         <span class="w-1.5 h-1.5 rounded-full" [class]="s.color"></span>
                         <span class="text-white">{{s.name}}</span>
                      </td>
                      <td class="py-3 text-right text-gray-400">{{s.assets}}</td>
                      <td class="py-3 text-right text-white">₹{{s.invested | number}}</td>
                      <td class="py-3 text-right">
                         <div class="flex flex-col items-end">
                            <span class="text-white">{{s.allocation}}%</span>
                            <div class="w-16 h-1 bg-gray-800 mt-1 rounded-full overflow-hidden">
                               <div class="h-full bg-indigo-500" [style.width.%]="s.allocation * 2"></div>
                            </div>
                         </div>
                      </td>
                      <td class="py-3 text-right" [class]="s.returns >= 0 ? 'text-wealth-green' : 'text-wealth-red'">
                         {{s.returns >= 0 ? '+' : ''}}{{s.returns}}%
                      </td>
                      <td class="py-3 text-right">
                         <div class="flex items-center justify-end gap-1">
                            <span *ngFor="let i of s.industries" class="text-[7px] px-1 py-0.5 rounded bg-gray-800 text-gray-400 font-bold uppercase tracking-tight">{{i}}</span>
                         </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>
        </div>

      </div>

      <!-- ── Asset Allocation Tab ── -->
      <div *ngIf="activeAnalysisTab === 'Asset Allocation'" class="space-y-4 animate-in">
        
        <!-- Asset KPIs -->
        <div class="grid grid-cols-4 gap-4">
           <div *ngFor="let k of assetKpis" class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <p class="text-[9px] text-gray-500 uppercase font-bold mb-1">{{k.label}}</p>
              <p class="text-lg font-black text-white">₹{{k.value | number}}</p>
              <div class="flex items-center gap-1.5 mt-1">
                 <span class="text-[10px] font-bold text-white">{{k.pct}}%</span>
                 <div class="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full" [class]="k.color" [style.width.%]="k.pct"></div>
                 </div>
              </div>
           </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <!-- Asset Allocation Donut -->
          <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[340px] flex flex-col">
             <p class="text-[11px] font-bold text-gray-400 mb-4">Current Allocation</p>
             <div class="relative flex-1 flex flex-col items-center justify-center">
                <svg viewBox="0 0 100 100" class="w-40 h-40">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#1c2136" stroke-width="12"/>
                  <!-- Mock Slices -->
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" stroke-width="12" stroke-dasharray="140 219.8"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" stroke-width="12" stroke-dasharray="50 219.8" stroke-dashoffset="-140"/>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="29.8 219.8" stroke-dashoffset="-190"/>
                </svg>
                <div class="absolute flex flex-col items-center">
                   <span class="text-[10px] text-gray-500 font-bold uppercase">Equity</span>
                   <span class="text-sm font-black text-white">65.4%</span>
                </div>
             </div>
             <div class="grid grid-cols-2 gap-2 mt-4">
                <div *ngFor="let a of assetAllocationSummary" class="flex items-center gap-2">
                   <div [class]="a.color" class="w-1.5 h-1.5 rounded-full"></div>
                   <span class="text-[9px] text-gray-400 font-medium truncate">{{a.label}}</span>
                   <span class="text-[9px] font-bold text-white ml-auto">{{a.pct}}%</span>
                </div>
             </div>
          </div>

          <!-- Allocation Over Time -->
          <div class="col-span-8 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[340px] flex flex-col">
             <div class="flex items-center justify-between mb-4">
               <p class="text-[11px] font-bold text-gray-400">Allocation Over Time</p>
               <div class="flex p-0.5 bg-gray-900 border border-gray-800 rounded-lg">
                  <button class="px-2 py-0.5 text-[8px] font-bold text-white bg-gray-800 rounded">6M</button>
                  <button class="px-2 py-0.5 text-[8px] font-medium text-gray-500">1Y</button>
                  <button class="px-2 py-0.5 text-[8px] font-medium text-gray-500">ALL</button>
               </div>
             </div>
             <div class="flex-1 bg-gray-900/20 rounded-xl border border-gray-800/40 relative overflow-hidden">
                <!-- Stacked Area Chart Mockup -->
                <svg viewBox="0 0 100 40" class="w-full h-full" preserveAspectRatio="none">
                   <!-- Cash -->
                   <path d="M 0 40 L 0 35 Q 25 34 50 36 Q 75 35 100 34 L 100 40 Z" fill="#10b981" fill-opacity="0.2"/>
                   <!-- Debt -->
                   <path d="M 0 35 Q 25 34 50 36 Q 75 35 100 34 L 100 25 Q 75 24 50 26 Q 25 25 0 24 Z" fill="#f59e0b" fill-opacity="0.2"/>
                   <!-- Equity -->
                   <path d="M 0 24 Q 25 25 50 26 Q 75 24 100 25 L 100 10 Q 75 8 50 12 Q 25 15 0 12 Z" fill="#3b82f6" fill-opacity="0.2"/>
                   
                   <!-- Lines -->
                   <path d="M 0 12 Q 25 15 50 12 Q 75 8 100 10" fill="none" stroke="#3b82f6" stroke-width="1"/>
                   <path d="M 0 24 Q 25 25 50 26 Q 75 24 100 25" fill="none" stroke="#f59e0b" stroke-width="1"/>
                   <path d="M 0 35 Q 25 34 50 36 Q 75 35 100 34" fill="none" stroke="#10b981" stroke-width="1"/>
                </svg>
                <div class="absolute bottom-2 left-4 right-4 flex justify-between">
                   <span *ngFor="let m of ['Jan','Feb','Mar','Apr','May','Jun']" class="text-[7px] text-gray-600 font-bold uppercase">{{m}}</span>
                </div>
             </div>
             <div class="flex items-center gap-4 mt-3">
                <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div><span class="text-[8px] text-gray-500 font-bold">EQUITY</span></div>
                <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-amber-500"></div><span class="text-[8px] text-gray-500 font-bold">DEBT</span></div>
                <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><span class="text-[8px] text-gray-500 font-bold">CASH</span></div>
             </div>
          </div>
        </div>

      </div>

      <!-- ── Performance Tab ── -->
      <div *ngIf="activeAnalysisTab === 'Performance'" class="space-y-4 animate-in">
        
        <!-- Performance KPI Strip -->
        <div class="grid grid-cols-5 gap-0 bg-[#0d1120] border border-gray-800/60 rounded-2xl divide-x divide-gray-800/60 overflow-hidden">
           <div *ngFor="let k of performanceKpis" class="px-5 py-4">
              <p class="text-[9px] text-gray-500 uppercase font-extrabold mb-1 tracking-wider">{{k.label}}</p>
              <div class="flex items-baseline gap-1.5">
                 <p class="text-xl font-black text-white">{{k.value}}{{k.unit}}</p>
                 <p *ngIf="k.change !== undefined" class="text-[10px] font-bold" [class]="k.change >= 0 ? 'text-wealth-green' : 'text-wealth-red'">
                    {{k.change >= 0 ? '▲' : '▼'}} {{abs(k.change) | number:'1.1-1'}}%
                 </p>
              </div>
              <p class="text-[8px] text-gray-600 font-bold mt-1 uppercase">{{k.desc}}</p>
           </div>
        </div>

        <div class="grid grid-cols-12 gap-4">
          <!-- Growth Chart -->
          <div class="col-span-8 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[360px] flex flex-col">
             <div class="flex items-center justify-between mb-4">
               <p class="text-[11px] font-bold text-gray-400">Portfolio Growth vs Benchmark</p>
               <div class="flex p-0.5 bg-gray-900 border border-gray-800 rounded-lg">
                  <button class="px-2 py-0.5 text-[8px] font-medium text-gray-500">1M</button>
                  <button class="px-2 py-0.5 text-[8px] font-bold text-white bg-gray-800 rounded">6M</button>
                  <button class="px-2 py-0.5 text-[8px] font-medium text-gray-500">1Y</button>
                  <button class="px-2 py-0.5 text-[8px] font-medium text-gray-500">ALL</button>
               </div>
             </div>
             <div class="flex-1 bg-gray-900/20 rounded-xl border border-gray-800/40 relative overflow-hidden p-6">
                <!-- Mockup Growth Lines -->
                <svg viewBox="0 0 100 40" class="w-full h-full" preserveAspectRatio="none">
                   <!-- Benchmark (Dash) -->
                   <path d="M 0 30 Q 25 28 50 25 Q 75 22 100 20" fill="none" stroke="#6b7280" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>
                   <!-- Portfolio -->
                   <path d="M 0 35 Q 25 32 50 22 Q 75 18 100 12 L 100 40 L 0 40 Z" fill="url(#growthGrad)" opacity="0.1"/>
                   <path d="M 0 35 Q 25 32 50 22 Q 75 18 100 12" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
                   <defs>
                     <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stop-color="#6366f1" />
                       <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                     </linearGradient>
                   </defs>
                </svg>
                <!-- Tooltip Mockup -->
                <div class="absolute top-[30%] left-[55%] flex flex-col items-center">
                   <div class="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-500 shadow-lg"></div>
                   <div class="mt-2 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl text-[9px] font-bold">
                      <p class="text-white">₹48,25,120</p>
                      <p class="text-wealth-green">+14.2%</p>
                      <p class="text-[7px] text-gray-500 mt-0.5">MAY 15, 2024</p>
                   </div>
                </div>
                <div class="absolute bottom-2 left-6 right-6 flex justify-between text-[7px] text-gray-600 font-black">
                   <span *ngFor="let m of ['JAN','FEB','MAR','APR','MAY','JUN']">{{m}} '24</span>
                </div>
             </div>
          </div>

          <!-- Returns Summary Table -->
          <div class="col-span-4 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 min-h-[360px] flex flex-col">
             <p class="text-[11px] font-bold text-gray-400 mb-4">Returns Summary</p>
             <div class="space-y-2 flex-1">
                <div *ngFor="let r of performanceTable" class="flex items-center justify-between py-2.5 border-b border-gray-800/40 last:border-0">
                   <span class="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{{r.period}}</span>
                   <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black" [class]="r.value >= 0 ? 'text-wealth-green' : 'text-wealth-red'">
                        {{r.value >= 0 ? '+' : ''}}{{r.value | number:'1.2-2'}}%
                      </span>
                      <span class="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 min-w-[32px] text-center">
                        {{r.bench >= 0 ? '+' : ''}}{{r.bench}}%
                      </span>
                   </div>
                </div>
             </div>
             <div class="mt-4 p-3 bg-gray-900/40 rounded-xl border border-gray-800/40">
                <div class="flex justify-between items-center">
                   <p class="text-[9px] text-gray-500 font-bold uppercase">Alpha since inception</p>
                   <p class="text-xs font-black text-wealth-green">+8.42%</p>
                </div>
             </div>
          </div>
        </div>

      </div>

      <!-- ── Holdings Analysis Tab ── -->
      <div *ngIf="activeAnalysisTab === 'Holdings Analysis'" class="space-y-6 animate-in">
        
        <div class="flex items-center justify-between">
           <div class="flex items-center gap-2">
             <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
               <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM18 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
             </div>
             <div>
                <p class="text-[11px] font-black text-white uppercase tracking-wider">AI Recommendations</p>
                <p class="text-[10px] text-gray-500 font-medium">Smart recommendations to optimize your portfolio</p>
             </div>
           </div>
           <div class="flex items-center gap-4">
              <button class="text-[10px] text-indigo-400 font-bold hover:underline">View all insights →</button>
              <div class="flex gap-1">
                 <button class="p-1.5 rounded-lg border border-gray-800 text-gray-600 hover:text-white transition-colors">
                   <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                 </button>
                 <span class="text-[10px] text-gray-500 font-black flex items-center px-1">1 / 3</span>
                 <button class="p-1.5 rounded-lg border border-gray-800 text-gray-600 hover:text-white transition-colors">
                   <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                 </button>
              </div>
           </div>
        </div>

        <!-- AI Cards Carousel -->
        <div class="grid grid-cols-4 gap-4 pb-2">
           <div *ngFor="let rec of aiRecommendations" class="bg-[#1c2136]/30 border border-gray-800/60 rounded-2xl p-5 hover:border-indigo-500/40 transition-all group flex flex-col h-full relative overflow-hidden">
              <div class="flex items-start justify-between mb-4">
                 <div [class]="rec.iconBg" class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-white/5">
                    {{rec.icon}}
                 </div>
                 <div class="flex gap-1">
                    <span *ngFor="let tag of rec.tags" [class]="tag.cls" class="text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tight">{{tag.label}}</span>
                 </div>
              </div>
              
              <p class="text-sm font-black text-white mb-1.5">{{rec.title}}</p>
              <p class="text-[11px] text-gray-500 font-medium leading-relaxed mb-4 flex-1">{{rec.description}}</p>
              
              <div class="space-y-2 mb-5">
                 <div *ngFor="let m of rec.metrics" class="flex items-center justify-between">
                    <span class="text-[9px] text-gray-400 font-bold uppercase">{{m.label}}</span>
                    <div class="flex items-center gap-1">
                       <span class="text-[9px] font-black text-white">{{m.value}}</span>
                       <svg *ngIf="m.trend" class="w-2.5 h-2.5" [class]="m.trend === 'up' ? 'text-wealth-green' : 'text-wealth-red'" fill="currentColor" viewBox="0 0 24 24">
                          <path *ngIf="m.trend === 'up'" d="M7 14l5-5 5 5H7z"/>
                          <path *ngIf="m.trend === 'down'" d="M7 10l5 5 5-5H7z"/>
                       </svg>
                    </div>
                 </div>
              </div>

              <div class="flex gap-2">
                 <button [class]="rec.primaryBtnCls" class="flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all shadow-md active:scale-95">{{rec.primaryBtn}}</button>
                 <button class="flex-1 py-1.5 rounded-xl text-[10px] font-black text-gray-400 bg-gray-900/50 border border-gray-800 hover:text-white hover:bg-gray-800 transition-all">{{rec.secondaryBtn}}</button>
              </div>
           </div>
        </div>

      </div>

      <!-- Section: Holdings Table -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
            <p class="text-[11px] font-bold text-white uppercase tracking-wider">Holdings</p>
          </div>
          
          <div class="flex items-center gap-3">
             <!-- Type tabs -->
             <div *ngIf="(holdingsByType$ | async) as byType" class="flex p-0.5 bg-gray-900 border border-gray-800 rounded-lg uppercase tracking-tight">
                <button (click)="filterType(null)"
                  [class]="(selectedType$ | async) === null ? 'px-3 py-1 text-[8px] font-bold text-white bg-gray-800 rounded-md shadow-sm' : 'px-3 py-1 text-[8px] font-medium text-gray-500 hover:text-gray-300 transition-colors'">
                  All ({{ (filteredHoldings$ | async)?.length || 0 }})
                </button>
                <button *ngFor="let type of getActiveTypes(byType)" (click)="filterType(type)"
                  [class]="(selectedType$ | async) === type ? 'px-3 py-1 text-[8px] font-bold text-white bg-gray-800 rounded-md shadow-sm' : 'px-3 py-1 text-[8px] font-medium text-gray-500 hover:text-gray-300 transition-colors'">
                  {{ getLabel(type) }} ({{ byType[type]?.length || 0 }})
                </button>
             </div>

             <div class="relative">
                <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input [(ngModel)]="searchTerm" placeholder="Search holdings..." class="pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-[10px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-48 font-medium">
             </div>
             <button class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white transition-all">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                Filter
             </button>
          </div>
        </div>

        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl overflow-hidden shadow-2xl">
          <!-- Column Headers -->
          <div *ngIf="activeAnalysisTab !== 'Risk Analysis' && activeAnalysisTab !== 'Holdings Analysis'" class="grid holdings-grid-ov text-[9px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3 border-b border-gray-800/60 bg-gray-900/20">
            <div>Asset</div>
            <div>Type</div>
            <div class="text-right">Qty / Units</div>
            <div class="text-right">Current Value</div>
            <div class="text-right">Gain / Loss <p class="text-[8px] font-medium text-gray-700">₹ | % (Pre-Tax)</p></div>
            <div class="text-right">Return (%)</div>
            <div class="text-right">Allocation</div>
            <div class="text-center">LTCG<br>Eligible</div>
            <div class="text-right">Action</div>
          </div>
          
          <div *ngIf="activeAnalysisTab === 'Risk Analysis'" class="grid holdings-grid-risk text-[9px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3 border-b border-gray-800/60 bg-gray-900/20">
            <div>Asset</div>
            <div>Type</div>
            <div class="text-right">Qty / Units</div>
            <div class="text-right">Current Value</div>
            <div class="text-right">Weight (%)</div>
            <div class="text-right">Beta</div>
            <div class="text-right">Volatility (%)</div>
            <div class="text-right">Risk Level</div>
            <div class="text-right">Contr. to Risk</div>
            <div class="text-right">Action</div>
          </div>

          <div *ngIf="activeAnalysisTab === 'Holdings Analysis'" class="grid holdings-grid-ai text-[9px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3 border-b border-gray-800/60 bg-gray-900/20">
            <div>Asset</div>
            <div>Type</div>
            <div class="text-right">Qty / Units</div>
            <div class="text-right">Invested</div>
            <div class="text-right">Current Value</div>
            <div class="text-right">P&L (%)</div>
            <div>AI Insight</div>
            <div class="text-right">Action</div>
          </div>

          <!-- Rows (Standard / Overview) -->
          <div *ngIf="activeAnalysisTab !== 'Risk Analysis' && activeAnalysisTab !== 'Holdings Analysis'" class="divide-y divide-gray-800/40">
            <div *ngFor="let h of filterBySearch((filteredHoldings$ | async) || [])"
              class="grid holdings-grid-ov px-5 py-3.5 hover:bg-gray-800/20 transition-all group items-center">
              
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-400 group-hover:border-indigo-500/50 transition-colors">
                  {{ (h.symbol || h.name)?.substring(0,3)?.toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <p class="text-[11px] font-bold text-white truncate">{{ h.name }}</p>
                    <span *ngIf="h.ltcgEligible" class="text-[8px] font-bold px-1 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/20">LTCG</span>
                  </div>
                  <p class="text-[9px] text-gray-500 truncate">{{ h.exchange || 'NSE' }} • {{ h.sector || 'Others' }}</p>
                </div>
              </div>

              <div><span class="text-[9px] font-bold px-2 py-0.5 rounded-full border border-current opacity-70" [ngClass]="getTypeBadge(h.assetType)">{{ h.assetType.replace('_', ' ') }}</span></div>
              <div class="text-right text-[10px] font-bold text-gray-300">{{ h.quantity | number:'1.0-2' }} <span class="text-[9px] font-medium text-gray-600 ml-0.5">{{ getUnit(h.assetType) }}</span></div>
              <div class="text-right"><p class="text-[11px] font-bold text-white">₹{{ h.currentValue | number:'1.0-0' }}</p><p class="text-[9px] text-gray-600">₹{{ h.investedValue | number:'1.0-0' }}</p></div>
              <div class="text-right"><p class="text-[11px] font-black" [class.text-wealth-green]="(h.gainLoss||0)>=0" [class.text-wealth-red]="(h.gainLoss||0)<0">+₹{{ (h.gainLoss||0) | number:'1.0-0' }}</p><p class="text-[9px] font-bold" [class.text-wealth-green]="(h.gainLoss||0)>=0" [class.text-wealth-red]="(h.gainLoss||0)<0">{{ (h.gainLossPercent||0)>=0?'+':'' }}{{ (h.gainLossPercent||0) | number:'1.2-2' }}%</p></div>
              <div class="text-right text-[11px] font-black" [class.text-wealth-green]="(h.gainLossPercent||0)>=0">+{{ (h.gainLossPercent||0) | number:'1.2-2' }}%</div>
              <div class="text-right min-w-[70px]"><p class="text-[10px] font-bold text-white mb-1">7.56%</p><div class="w-full h-1 bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-indigo-500 rounded-full" style="width: 7.56%"></div></div></div>
              <div class="text-center font-bold font-bold"><span class="text-[9px]" [class]="h.ltcgEligible ? 'text-wealth-green' : 'text-wealth-red'">{{ h.ltcgEligible ? 'Yes' : 'No' }}</span></div>
              <div class="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all"><button class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></button></div>
            </div>
          </div>

          <!-- Rows (Risk Analysis) -->
          <div *ngIf="activeAnalysisTab === 'Risk Analysis'" class="divide-y divide-gray-800/40 animate-in">
            <div *ngFor="let h of filterBySearch((filteredHoldings$ | async) || [])"
              class="grid holdings-grid-risk px-5 py-3.5 hover:bg-gray-800/20 transition-all group items-center">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-400">{{ (h.symbol || h.name)?.substring(0,3)?.toUpperCase() }}</div>
                <div class="min-w-0"><p class="text-[11px] font-bold text-white truncate">{{ h.name }}</p><p class="text-[9px] text-gray-500 truncate">{{ h.sector || 'Others' }}</p></div>
              </div>
              <div><span class="text-[9px] font-bold px-2 py-0.5 rounded-full border border-current opacity-70" [ngClass]="getTypeBadge(h.assetType)">{{ h.assetType.replace('_', ' ') }}</span></div>
              <div class="text-right text-[10px] font-bold text-gray-300">{{ h.quantity | number:'1.0-2' }}</div>
              <div class="text-right text-[11px] font-bold text-white">₹{{ h.currentValue | number:'1.0-0' }}</div>
              <div class="text-right text-[11px] font-bold text-white">7.56%</div>
              <div class="text-right text-[11px] font-bold text-white">0.78</div>
              <div class="text-right text-[11px] font-bold text-white">18.45%</div>
              <div class="text-right"><span class="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">Moderate</span></div>
              <div class="text-right text-[11px] font-bold text-white">12.45%</div>
              <div class="text-right"><button class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"><svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></button></div>
            </div>
          </div>

          <!-- Rows (Holdings Analysis) -->
          <div *ngIf="activeAnalysisTab === 'Holdings Analysis'" class="divide-y divide-gray-800/40 animate-in">
            <div *ngFor="let h of filterBySearch((filteredHoldings$ | async) || []); let i = index"
              class="grid holdings-grid-ai px-5 py-3.5 hover:bg-gray-800/20 transition-all group items-center">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-[11px] font-bold text-gray-400">{{ (h.symbol || h.name)?.substring(0,3)?.toUpperCase() }}</div>
                <div class="min-w-0"><p class="text-[11px] font-bold text-white truncate">{{ h.name }}</p><p class="text-[9px] text-gray-500 truncate">{{ h.sector || 'Others' }}</p></div>
              </div>
              <div><span class="text-[9px] font-bold px-2 py-0.5 rounded-full border border-current opacity-70" [ngClass]="getTypeBadge(h.assetType)">{{ h.assetType.replace('_', ' ') }}</span></div>
              <div class="text-right text-[10px] font-bold text-gray-300">{{ h.quantity | number:'1.0-1' }}</div>
              <div class="text-right text-[11px] font-bold text-white">₹{{ h.investedValue | number:'1.0-0' }}</div>
              <div class="text-right text-[11px] font-bold text-white">₹{{ h.currentValue | number:'1.0-0' }}</div>
              <div class="text-right text-[11px] font-black" [class.text-wealth-green]="(h.gainLossPercent||0)>=0">{{ (h.gainLossPercent||0) | number:'1.2-2' }}%</div>
              <div class="flex items-start gap-2"><div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" [class]="getAiInsight(i).color"></div><p class="text-[10px] text-gray-400 font-bold leading-tight italic">{{ getAiInsight(i).text }}</p></div>
              <div class="text-right"><button class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"><svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></button></div>
            </div>
          </div>

          <!-- Pagination Mock -->
          <div class="px-5 py-3 border-t border-gray-800/60 flex items-center justify-between bg-gray-900/10">
            <p class="text-[10px] text-gray-500">Showing 1 to 5 of 24 holdings</p>
            <div class="flex items-center gap-1.5">
              <button class="w-6 h-6 flex items-center justify-center rounded border border-gray-800 text-gray-600 bg-gray-900/50">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button class="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600/20 border border-indigo-500/50 rounded">1</button>
              <button class="px-2.5 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-300 transition-colors">2</button>
              <button class="px-2.5 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-300 transition-colors">3</button>
              <button class="px-2.5 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-300 transition-colors">4</button>
              <button class="px-2.5 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-300 transition-colors">5</button>
              <button class="w-6 h-6 flex items-center justify-center rounded border border-gray-800 text-gray-400 bg-gray-900/50 hover:text-white transition-colors">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </button>
              <div class="ml-4 flex items-center gap-2">
                <span class="text-[10px] text-gray-500">5 / page</span>
                <svg class="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <we-add-holding-form *ngIf="showAddForm" (cancel)="showAddForm=false" (saved)="onSaved()"></we-add-holding-form>
      <we-add-holding-form *ngIf="editingHolding" [editHolding]="editingHolding" (cancel)="editingHolding=null" (saved)="editingHolding=null"></we-add-holding-form>

      <!-- Delete confirm -->
      <div *ngIf="confirmDeleteId" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div class="bg-[#0d1120] border border-gray-800 rounded-2xl p-5 max-w-xs w-full mx-4">
          <h3 class="text-sm font-bold text-white mb-1">Delete Holding?</h3>
          <p class="text-xs text-gray-400 mb-4">This holding will be soft-deleted. Transaction history is preserved.</p>
          <div class="flex gap-2 justify-end">
            <button (click)="confirmDeleteId=null" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-all">Cancel</button>
            <button (click)="confirmDelete()" class="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .holdings-grid-ov {
      display: grid;
      grid-template-columns: 2.2fr 0.8fr 0.7fr 1fr 1fr 0.7fr 1fr 0.6fr 0.8fr;
      align-items: center;
      column-gap: 12px;
    }
    .holdings-grid-risk {
      display: grid;
      grid-template-columns: 2fr 0.8fr 0.8fr 1fr 1fr 0.6fr 0.8fr 0.8fr 1fr 0.6fr;
      align-items: center;
      column-gap: 12px;
    }
    .holdings-grid-ai {
      display: grid;
      grid-template-columns: 2fr 0.8fr 0.8fr 1fr 1fr 0.8fr 2.5fr 0.5fr;
      align-items: center;
      column-gap: 12px;
    }
    .animate-in {
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HoldingsComponent implements OnInit, OnDestroy {
  showAddForm = false;
  editingHolding: AssetDto | null = null;
  confirmDeleteId: number | null = null;
  searchTerm = '';
  showPostTax = false;
  analysisTabs = ['Overview', 'Risk Analysis', 'Sector Analysis', 'Asset Allocation', 'Performance', 'Holdings Analysis'];
  activeAnalysisTab = 'Overview';

  keyInsightsOverview = [
    { color: 'bg-wealth-green', text: 'Your portfolio is well diversified across asset classes.' },
    { color: 'bg-amber-500', text: 'High exposure to small caps. Consider rebalancing.' },
    { color: 'bg-red-500', text: 'Energy sector allocation is higher than recommended.' },
    { color: 'bg-yellow-500', text: 'SIP in index funds can improve long-term returns.' },
  ];

  overviewMetrics = [
    { label: 'Diversification Score', value: '7.5 / 10', tag: 'Good' },
    { label: 'Risk Level', value: 'Moderate', tag: '' },
    { label: 'Expected Return (1Y)', value: '12.5% – 15.8%', tag: '' },
    { label: 'Sharpe Ratio', value: '1.12', tag: 'Good' },
    { label: 'Max Drawdown / Beta', value: '-8.3% / 0.92', tag: '' },
  ];

  riskBreakdown = [
    { label: 'Low Risk (0-3)', pct: 31, color: 'bg-wealth-green' },
    { label: 'Moderate Risk (3-7)', pct: 48, color: 'bg-amber-500' },
    { label: 'High Risk (7-10)', pct: 21, color: 'bg-wealth-red' },
  ];

  riskMetricsTable = [
    { label: 'Beta', value: '0.92', tag: 'Low', badgeCls: 'text-wealth-green bg-wealth-green/10' },
    { label: 'Alpha (p.a.)', value: '2.35%', tag: 'Good', badgeCls: 'text-wealth-green bg-wealth-green/10' },
    { label: 'Sharpe Ratio', value: '1.12', tag: 'Good', badgeCls: 'text-wealth-green bg-wealth-green/10' },
    { label: 'Sortino Ratio', value: '1.48', tag: 'Good', badgeCls: 'text-wealth-green bg-wealth-green/10' },
    { label: 'Standard Deviation', value: '12.35%', tag: 'Moderate', badgeCls: 'text-amber-500 bg-amber-500/10' },
    { label: 'Downside Deviation', value: '8.45%', tag: 'Moderate', badgeCls: 'text-amber-500 bg-amber-500/10' },
    { label: 'Maximum Drawdown', value: '-8.62%', tag: 'Moderate', badgeCls: 'text-amber-500 bg-amber-500/10' },
    { label: 'Calmar Ratio', value: '1.71', tag: 'Good', badgeCls: 'text-wealth-green bg-wealth-green/10' },
  ];

  riskConcentration = [
    { icon: '🏦', name: 'Reliance Industries', pct: 14.25 },
    { icon: '🏢', name: 'HDFC Bank', pct: 9.18 },
    { icon: '🏦', name: 'ICICI Bank', pct: 6.72 },
    { icon: '🏧', name: 'SBI', pct: 5.31 },
    { icon: '🏗️', name: 'Larsen & Toubro', pct: 4.85 },
  ];

  sectorSummary = [
    { label: 'Financial Services', pct: 32.4, color: 'bg-indigo-500' },
    { label: 'Information Tech', pct: 18.2, color: 'bg-emerald-500' },
    { label: 'Energy / Oil & Gas', pct: 14.5, color: 'bg-amber-500' },
    { label: 'Consumer Goods', pct: 9.8, color: 'bg-rose-500' },
  ];

  sectorAnalysisTable = [
    { name: 'Financial Services', assets: 8, invested: 425000, allocation: 32.4, returns: 5.2, color: 'bg-indigo-500', industries: ['Banking', 'NBFC'] },
    { name: 'Information Tech', assets: 5, invested: 215000, allocation: 18.2, returns: -2.1, color: 'bg-emerald-500', industries: ['Software', 'Services'] },
    { name: 'Energy', assets: 3, invested: 185000, allocation: 14.5, returns: 8.4, color: 'bg-amber-500', industries: ['Oil & Gas'] },
    { name: 'Consumer Goods', assets: 4, invested: 120000, allocation: 9.8, returns: 1.2, color: 'bg-rose-500', industries: ['FMCG'] },
    { name: 'Health Care', assets: 2, invested: 85000, allocation: 4.5, returns: 3.6, color: 'bg-teal-500', industries: ['Pharma'] },
  ];

  assetKpis = [
    { label: 'Equity Allocation', value: 3450000, pct: 65.4, color: 'bg-blue-500' },
    { label: 'Debt Allocation', value: 1250000, pct: 23.7, color: 'bg-amber-500' },
    { label: 'Gold / Precious', value: 350000, pct: 6.6, color: 'bg-yellow-500' },
    { label: 'Cash & Others', value: 225000, pct: 4.3, color: 'bg-emerald-500' },
  ];

  assetAllocationSummary = [
    { label: 'Equity', pct: 65.4, color: 'bg-blue-500' },
    { label: 'Debt', pct: 23.7, color: 'bg-amber-500' },
    { label: 'Gold', pct: 6.6, color: 'bg-yellow-500' },
    { label: 'Cash', pct: 4.3, color: 'bg-emerald-500' },
  ];

  performanceKpis = [
    { label: 'XIRR (p.a.)', value: '18.42', unit: '%', desc: 'Weighted average', change: 1.2 },
    { label: 'Absolute Return', value: '42.15', unit: '%', desc: 'Total growth', change: 4.5 },
    { label: 'Daily Return', value: '+4,250', unit: '', desc: 'Today\'s change', change: 0.8 },
    { label: 'Best Day (1Y)', value: '+3.12', unit: '%', desc: 'Jun 14, 2023', change: undefined },
    { label: 'Worst Day (1Y)', value: '-2.85', unit: '%', desc: 'Jan 15, 2024', change: undefined },
  ];

  performanceTable = [
    { period: '1 Month', value: 4.25, bench: 3.12 },
    { period: '3 Months', value: 12.82, bench: 8.45 },
    { period: '6 Months', value: 18.45, bench: 12.31 },
    { period: '1 Year', value: 24.18, bench: 15.62 },
    { period: '3 Years (p.a.)', value: 19.32, bench: 12.85 },
    { period: 'Inception (p.a.)', value: 21.45, bench: 14.12 },
  ];

  aiRecommendations = [
    {
      icon: '📈', iconBg: 'bg-emerald-500/20 text-emerald-400', title: 'Add ₹20,000 to Index Funds',
      description: 'Market is undervalued and your portfolio has low index fund allocation.',
      metrics: [
        { label: 'Impact', value: 'Opportunity', trend: 'up' },
        { label: 'Risk', value: 'Moderate', trend: 'up' },
        { label: 'Diversification', value: '+15%', trend: 'up' }
      ],
      tags: [{ label: 'Opportunity', cls: 'bg-emerald-500/20 text-emerald-400' }, { label: 'Diversification', cls: 'bg-emerald-500/20 text-emerald-400' }],
      primaryBtn: 'Invest', secondaryBtn: 'Analyze', primaryBtnCls: 'bg-emerald-600 hover:bg-emerald-500 text-white'
    },
    {
      icon: '🟠', iconBg: 'bg-amber-500/20 text-amber-400', title: 'Reduce Reliance Exposure',
      description: 'You are overweight by 8.2% in Reliance Industries compared to recommended allocation.',
      metrics: [
        { label: 'Impact', value: 'Equal', trend: undefined },
        { label: 'Risk', value: 'Lower', trend: 'down' },
        { label: 'Concentration', value: '-8.2%', trend: 'down' }
      ],
      tags: [{ label: 'Attention', cls: 'bg-amber-500/20 text-amber-400' }, { label: 'Concentration', cls: 'bg-amber-500/20 text-amber-400' }],
      primaryBtn: 'Sell', secondaryBtn: 'View Details', primaryBtnCls: 'bg-amber-600 hover:bg-amber-500 text-white'
    },
    {
      icon: '🛡️', iconBg: 'bg-red-500/20 text-red-400', title: 'High Small Cap Allocation',
      description: 'Small cap allocation is 28% which is higher than the recommended range (15% - 20%).',
      metrics: [
        { label: 'Impact', value: 'Equal', trend: undefined },
        { label: 'Volatility', value: 'Higher', trend: 'up' },
        { label: 'Risk', value: 'High', trend: 'up' }
      ],
      tags: [{ label: 'High Risk', cls: 'bg-red-500/20 text-red-400' }, { label: 'Allocation', cls: 'bg-red-500/20 text-red-400' }],
      primaryBtn: 'Rebalance', secondaryBtn: 'Analyze', primaryBtnCls: 'bg-red-600 hover:bg-red-500 text-white'
    },
    {
      icon: '🛡️', iconBg: 'bg-blue-500/20 text-blue-400', title: 'Tax Efficiency Opportunity',
      description: 'You can save up to ₹12,450 in taxes by optimizing long term capital gains.',
      metrics: [
        { label: 'Impact', value: 'Tax Savings', trend: 'up' },
        { label: 'Risk', value: 'Neutral', trend: undefined }
      ],
      tags: [{ label: 'Opportunity', cls: 'bg-emerald-500/20 text-emerald-400' }, { label: 'Tax Efficiency', cls: 'bg-blue-500/20 text-blue-400' }],
      primaryBtn: 'Optimize Now', secondaryBtn: 'View Details', primaryBtnCls: 'bg-blue-600 hover:bg-blue-500 text-white'
    }
  ];

  getAiInsight(index: number) {
    const insights = [
      { color: 'bg-amber-500', text: 'Overweight. Consider reducing exposure.' },
      { color: 'bg-wealth-green', text: 'Good long-term fund. Stay invested.' },
      { color: 'bg-blue-500', text: 'Safe holding. Reinvest at maturity.' },
      { color: 'bg-yellow-500', text: 'Good core holding. Keep accumulating.' },
      { color: 'bg-wealth-green', text: 'Stable stock. Hold for growth.' },
      { color: 'bg-purple-500', text: 'Consistent fund. Good to continue.' }
    ];
    return insights[index % insights.length];
  }

  abs(v: number | undefined): number {
    return Math.abs(v || 0);
  }

  private destroyed$ = new Subject<void>();

  filteredHoldings$ = this.store.select(selectFilteredHoldings);
  holdingsByType$ = this.store.select(selectHoldingsByType);
  selectedType$ = this.store.select(selectSelectedType);
  loading$ = this.store.select(selectHoldingsLoading);

  getIcon = (t: string) => ASSET_ICONS[t] || '💼';
  getLabel = (t: string) => ASSET_LABELS[t] || t;

  constructor(private store: Store) { }

  ngOnInit() { this.store.dispatch(loadHoldings()); }
  ngOnDestroy() { this.destroyed$.next(); this.destroyed$.complete(); }

  getActiveTypes(byType: Record<string, any[]>) { return Object.keys(byType).filter(t => byType[t]?.length > 0); }
  filterType(type: string | null) { this.store.dispatch(setSelectedType({ assetType: type })); }

  filterBySearch(holdings: AssetDto[]) {
    if (!this.searchTerm) return holdings;
    const q = this.searchTerm.toLowerCase();
    return holdings.filter(h => h.name.toLowerCase().includes(q) || (h.symbol || '').toLowerCase().includes(q));
  }

  gainVal(h: AssetDto) { return this.showPostTax ? (h.gainLossPostTax || 0) : (h.gainLoss || 0); }

  getTypeBadge(type: string) {
    return ({ STOCK: 'text-blue-400 border-blue-900/50', MUTUAL_FUND: 'text-purple-400 border-purple-900/50', ETF: 'text-green-400 border-green-900/50', FD: 'text-amber-400 border-amber-900/50' } as any)[type] || 'text-gray-400 border-gray-800';
  }

  getUnit(type: string) { return ({ STOCK: 'Shares', MUTUAL_FUND: 'Units', ETF: 'Units', GOLD: 'Grams' } as any)[type] || 'Units'; }

  getTagLabel(h: AssetDto) {
    if ((h.gainLossPercent || 0) > 15) return 'Well Allocated';
    if ((h.gainLoss || 0) < 0 && h.assetType === 'STOCK') return 'Overweight';
    if (h.assetType === 'FD') return 'Safe';
    return 'Good Entry';
  }
  getTagDesc(h: AssetDto) {
    if ((h.gainLossPercent || 0) > 15) return 'Continue SIP';
    if ((h.gainLoss || 0) < 0 && h.assetType === 'STOCK') return 'Consider reducing exposure';
    if (h.assetType === 'FD') return 'Reinvest on maturity';
    return 'Good for long term';
  }
  getTagCls(h: AssetDto) {
    if ((h.gainLoss || 0) < 0 && h.assetType === 'STOCK') return 'bg-red-900/40 text-red-400 border border-red-800/20';
    if (h.assetType === 'FD') return 'bg-blue-900/40 text-blue-400 border border-blue-800/20';
    return 'bg-green-900/40 text-green-400 border border-green-800/20';
  }

  onEdit(h: AssetDto) { this.editingHolding = { ...h }; }
  onDelete(id: number) { this.confirmDeleteId = id; }
  confirmDelete() {
    if (this.confirmDeleteId) {
      this.store.dispatch(deleteHolding({ id: this.confirmDeleteId }));
      this.confirmDeleteId = null;
    }
  }
  onSaved() { this.showAddForm = false; this.store.dispatch(loadHoldings()); }
}
