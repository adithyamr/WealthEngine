import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../core/services/portfolio.service';

interface Pick { rank: number; name: string; symbol: string; rationale: string; score: number; potential: string; riskLevel: string; action: string; }

@Component({
    selector: 'we-ai-picks',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">AI Picks</h1>
          <p class="text-gray-500 text-xs">AI-powered stock recommendations</p>
        </div>
        <span class="text-[10px] text-gray-500 bg-gray-800 px-2.5 py-1 rounded-lg">New Picks: 3</span>
      </div>

      <!-- Pick type tabs -->
      <div class="flex gap-2">
        <button *ngFor="let t of ['Top Picks','Undervalued','Breakout Stocks','Long Term Bets']" (click)="tab=t"
          [class]="tab===t?'px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25':'px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-800 text-gray-500 hover:text-gray-300 border border-transparent transition-colors'">
          {{ t }}
        </button>
      </div>

      <!-- Column Headers -->
      <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
        <div class="grid picks-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-gray-800/60">
          <div>Stock</div><div>Rationale</div>
          <div class="text-center">AI Score</div><div class="text-center">Upside Potential</div>
          <div class="text-center">Risk Level</div><div class="text-right">Action</div>
        </div>
        <div class="mt-1 space-y-0.5">
          <div *ngFor="let p of picks" class="grid picks-grid px-2 py-3 rounded-xl hover:bg-gray-800/30 transition-colors items-center">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-300">{{ p.rank }}</div>
              <div>
                <p class="text-[10px] font-semibold text-white">{{ p.name }}</p>
                <p class="text-[9px] text-gray-500">{{ p.symbol }}</p>
              </div>
            </div>
            <p class="text-[9px] text-gray-400 pr-4">{{ p.rationale }}</p>
            <div class="text-center">
              <div class="inline-flex items-center gap-1">
                <div class="w-8 h-8 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                  <span class="text-[9px] font-bold text-white">{{ p.score }}</span>
                </div>
              </div>
            </div>
            <div class="text-center">
              <span class="text-[10px] font-bold text-wealth-green">{{ p.potential }}</span>
            </div>
            <div class="text-center">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                [ngClass]="p.riskLevel==='High'?'bg-red-900/40 text-red-400':p.riskLevel==='Medium'?'bg-amber-900/40 text-amber-400':'bg-green-900/40 text-green-400'">
                {{ p.riskLevel }}
              </span>
            </div>
            <div class="text-right">
              <button class="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold border border-indigo-700/30 px-2 py-1 rounded-lg">View →</button>
            </div>
          </div>
        </div>
      </div>
      <p class="text-[9px] text-gray-700 text-center">AI picks are for informational purposes only, not investment advice.</p>
    </div>
  `,
    styles: [`.picks-grid { display:grid; grid-template-columns:1.8fr 2.5fr 0.7fr 0.9fr 0.7fr 0.7fr; align-items:center; column-gap:12px; }`]
})
export class AiPicksComponent {
    tab = 'Top Picks';
    picks: Pick[] = [
        { rank: 1, name: 'ICICI Bank', symbol: 'ICICIBANK', rationale: 'Strong breakout above resistance with high volume', score: 89, potential: '18.5%', riskLevel: 'Medium', action: 'BUY' },
        { rank: 2, name: 'Larsen & Toubro', symbol: 'LT', rationale: 'Infra ordering strong, sector tailwind', score: 84, potential: '16.2%', riskLevel: 'Low', action: 'BUY' },
        { rank: 3, name: 'HDFC Life', symbol: 'HDFCLIFE', rationale: 'Undervalued vs peers, strong fundamentals', score: 80, potential: '23.1%', riskLevel: 'Medium', action: 'BUY' },
        { rank: 4, name: 'PI Industries', symbol: 'PIIND', rationale: 'Agro-chem export cycle turning positive', score: 76, potential: '18.7%', riskLevel: 'Medium', action: 'BUY' },
        { rank: 5, name: 'Coal India', symbol: 'COALINDIA', rationale: 'High dividend yield, stable cash flows', score: 72, potential: '12.3%', riskLevel: 'Low', action: 'HOLD' },
    ];
}
