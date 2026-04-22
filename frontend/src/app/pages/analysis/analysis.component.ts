import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage { role: 'user' | 'ai'; text: string; time: string; }

@Component({
  selector: 'we-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col px-5 py-4 gap-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">AI Analysis</h1>
          <p class="text-gray-500 text-xs">Deep-dive portfolio analysis and natural language queries</p>
        </div>
      </div>

      <!-- AI Picks section -->
      <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-xs font-bold text-white">AI Stock Picks</h2>
            <p class="text-[10px] text-gray-500">AI-powered stock recommendations for your portfolio</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[9px] text-emerald-400 bg-emerald-900/30 border border-emerald-800/40 px-2 py-0.5 rounded-full font-semibold">3 New Picks</span>
            <div class="flex gap-1.5">
              <button *ngFor="let t of ['Top Picks','Undervalued','Breakout Stocks','Long Term Bets']" (click)="activePick=t"
                [class]="activePick===t?'px-2 py-1 rounded-xl text-[9px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25':'px-2 py-1 rounded-xl text-[9px] font-medium bg-gray-800 text-gray-500 hover:text-gray-300 border border-transparent transition-colors'">
                {{ t }}
              </button>
            </div>
          </div>
        </div>
        <!-- Table header -->
        <div class="grid picks-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-gray-800/60">
          <div>Stock</div><div>Rationale</div>
          <div class="text-center">AI Score</div><div class="text-center">Upside</div>
          <div class="text-center">Risk</div><div class="text-right">Action</div>
        </div>
        <div class="mt-0.5">
          <div *ngFor="let p of picks" class="grid picks-grid px-2 py-2.5 rounded-xl hover:bg-gray-800/30 transition-colors items-center">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-[9px] font-bold text-indigo-300">{{ p.rank }}</div>
              <div>
                <p class="text-[10px] font-semibold text-white">{{ p.name }}</p>
                <p class="text-[9px] text-gray-500">{{ p.symbol }}</p>
              </div>
            </div>
            <p class="text-[9px] text-gray-400 pr-4">{{ p.rationale }}</p>
            <div class="text-center">
              <div class="w-8 h-8 rounded-full border-2 border-indigo-500 flex items-center justify-center mx-auto">
                <span class="text-[9px] font-bold text-white">{{ p.score }}</span>
              </div>
            </div>
            <div class="text-center"><span class="text-[10px] font-bold text-emerald-400">{{ p.potential }}</span></div>
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
        <p class="text-[9px] text-gray-700 text-center pt-2 border-t border-gray-800/60 mt-2">AI picks are for informational purposes only, not investment advice.</p>
      </div>

      <!-- Main Content (Chat + Recent Questions) -->
      <!-- Main Content (Chat + Recent Questions) -->
      <div class="flex gap-4 flex-1 min-h-0">

        <!-- ── Chat Area ── -->
        <div class="flex-1 flex flex-col bg-[#0d1120] border border-gray-800/60 rounded-2xl overflow-hidden">

          <!-- Chat Header -->
          <div class="px-4 py-3 border-b border-gray-800/60 flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-indigo-900/40 border border-indigo-700/30 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p class="text-xs font-bold text-white">Ask WealthEngine AI</p>
              <p class="text-[9px] text-gray-500">Get answers, insights and recommendations for your portfolio</p>
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            <ng-container *ngFor="let m of messages">
              <!-- AI message -->
              <div *ngIf="m.role==='ai'" class="flex gap-2">
                <div class="w-6 h-6 rounded-full bg-indigo-900/40 border border-indigo-700/30 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">🤖</div>
                <div class="max-w-2xl">
                  <div class="bg-gray-900/60 border border-gray-800/60 rounded-xl rounded-tl-sm px-3 py-2.5 text-[10px] text-gray-300 leading-relaxed">{{ m.text }}</div>
                  <p class="text-[8px] text-gray-600 mt-1 pl-1">{{ m.time }}</p>
                </div>
              </div>
              <!-- User message -->
              <div *ngIf="m.role==='user'" class="flex gap-2 justify-end">
                <div class="max-w-md">
                  <div class="bg-indigo-600/20 border border-indigo-600/30 rounded-xl rounded-tr-sm px-3 py-2.5 text-[10px] text-indigo-200 leading-relaxed">{{ m.text }}</div>
                  <p class="text-[8px] text-gray-600 mt-1 pr-1 text-right">{{ m.time }}</p>
                </div>
              </div>
            </ng-container>

            <!-- Welcome state -->
            <div *ngIf="messages.length===0" class="flex flex-col items-center justify-center h-full py-16">
              <div class="text-5xl mb-4">🤖</div>
              <p class="text-sm font-bold text-white mb-1">Ask me anything about your portfolio</p>
              <p class="text-xs text-gray-500 text-center max-w-sm">I can analyse your holdings, suggest rebalancing opportunities, explain tax implications, and more.</p>
            </div>

            <!-- Typing indicator -->
            <div *ngIf="loading" class="flex gap-2">
              <div class="w-6 h-6 rounded-full bg-indigo-900/40 border border-indigo-700/30 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
              <div class="bg-gray-900/60 border border-gray-800/60 rounded-xl px-3 py-2.5 flex gap-1 items-center">
                <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay:300ms"></span>
              </div>
            </div>
          </div>

          <!-- Quick Questions -->
          <div class="px-4 py-2 border-t border-gray-800/40 flex gap-1.5 flex-wrap">
            <button *ngFor="let q of quickQ" (click)="chatInput=q"
              class="px-2 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-[9px] text-gray-400 hover:text-white transition-all border border-gray-700/60">
              {{ q }}
            </button>
          </div>

          <!-- Input Area -->
          <div class="px-4 py-3 border-t border-gray-800/60 flex gap-2">
            <input [(ngModel)]="chatInput" (keydown.enter)="send()"
              placeholder="Type your question..."
              [disabled]="loading"
              class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-[10px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50">
            <button (click)="send()" [disabled]="loading || !chatInput.trim()"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5">
              ⚡ Ask AI
            </button>
          </div>
        </div>

        <!-- ── Right Panel: Recent Questions ── -->
        <div class="w-56 flex-shrink-0 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 flex flex-col">
          <h3 class="text-xs font-bold text-white mb-3">Recent Questions</h3>
          <div class="flex-1 space-y-3 overflow-y-auto">
            <div *ngFor="let rq of recentQ" class="cursor-pointer group" (click)="chatInput=rq.q; send()">
              <p class="text-[10px] text-gray-400 group-hover:text-white transition-colors leading-snug">{{ rq.q }}</p>
              <p class="text-[8px] text-gray-600 mt-0.5">{{ rq.time }}</p>
            </div>
          </div>
          <div class="pt-3 border-t border-gray-800/60 space-y-2 mt-3">
            <p class="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Suggested</p>
            <button *ngFor="let s of suggested" (click)="chatInput=s; send()"
              class="block w-full text-left text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors py-1 border-b border-gray-800/40 last:border-0">
              → {{ s }}
            </button>
          </div>
          <button class="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold mt-3 text-center">View all conversations →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: flex; flex-direction: column; height: 100%; }
    .picks-grid { display:grid; grid-template-columns:1.8fr 2.5fr 0.7fr 0.9fr 0.7fr 0.7fr; align-items:center; column-gap:12px; }`]
})
export class AnalysisComponent {
  chatInput = '';
  loading = false;
  messages: ChatMessage[] = [];

  activePick = 'Top Picks';
  picks = [
    { rank: 1, name: 'ICICI Bank', symbol: 'ICICIBANK', rationale: 'Strong breakout above resistance with high volume', score: 89, potential: '18.5%', riskLevel: 'Medium' },
    { rank: 2, name: 'Larsen & Toubro', symbol: 'LT', rationale: 'Infra ordering strong, sector tailwind', score: 84, potential: '16.2%', riskLevel: 'Low' },
    { rank: 3, name: 'HDFC Life', symbol: 'HDFCLIFE', rationale: 'Undervalued vs peers, strong fundamentals', score: 80, potential: '23.1%', riskLevel: 'Medium' },
    { rank: 4, name: 'PI Industries', symbol: 'PIIND', rationale: 'Agro-chem export cycle turning positive', score: 76, potential: '18.7%', riskLevel: 'Medium' },
    { rank: 5, name: 'Coal India', symbol: 'COALINDIA', rationale: 'High dividend yield, stable cash flows', score: 72, potential: '12.3%', riskLevel: 'Low' },
  ];

  quickQ = ['What should I invest this month?', 'Analyze my portfolio risk', 'Should I sell Reliance?', 'Best stocks for next 6 months'];
  suggested = ['Rebalancing suggestions', 'Tax harvesting opportunities', 'Sector exposure analysis'];

  recentQ = [
    { q: 'Analyze my portfolio risk', time: '2h ago' },
    { q: 'Best stocks for next 6 months', time: '1d ago' },
    { q: 'Should I sell Reliance?', time: '2d ago' },
    { q: 'What is my XIRR performance?', time: '3d ago' },
    { q: 'How diversified is my portfolio?', time: '5d ago' },
  ];

  mockResponses: Record<string, string> = {
    default: 'Based on your current portfolio allocation, you have 46% in Mutual Funds, 27% in Stocks, and 27% in Fixed Income. Your XIRR is 12.5% which is above the benchmark. I recommend reviewing your HDFC Top 100 Fund allocation as it has underperformed similar funds this quarter.',
  };

  nowTime() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

  send() {
    if (!this.chatInput.trim() || this.loading) return;
    const q = this.chatInput.trim();
    this.chatInput = '';
    this.messages.push({ role: 'user', text: q, time: this.nowTime() });
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      const lower = q.toLowerCase();
      let reply = this.mockResponses['default'];
      if (lower.includes('risk')) reply = 'Your portfolio risk score is 6.2/10 (Moderate). You have high exposure to small-cap funds (18%) which is above the recommended 10% for moderate risk profiles. Consider shifting 8% from small-cap to large-cap funds.';
      if (lower.includes('reliance')) reply = 'Reliance Industries is currently +22.4% in your portfolio. Given its strong fundamentals, I recommend holding. However, it represents 28% of your equity exposure — consider trimming to 20% to reduce concentration risk.';
      if (lower.includes('invest')) reply = 'For this month, consider: (1) Top up your ELSS fund by ₹10,000 for tax savings before year-end, (2) Add ₹5,000 to NIFTY 50 ETF for broad market exposure, (3) Consider 1-year FD at 7.5% for your idle cash.';
      if (lower.includes('xirr')) reply = 'Your portfolio XIRR is 12.5% vs benchmark 11.2%. Mutual Funds have delivered 14.2% XIRR while your direct stocks have delivered 9.8%. Your FD drags overall returns with 7.5%.';
      if (lower.includes('diversif')) reply = 'Portfolio diversification score: 7.5/10. You are well diversified across asset types. However, you have 82% domestic exposure. Adding international ETFs could improve diversification and reduce country-specific risk.';
      if (lower.includes('rebalanc')) reply = 'Rebalancing suggested: Reduce Stocks from 27% → 20%, increase Mutual Funds from 46% → 50%, and add International ETFs at 7%. This would improve your Sharpe ratio from 0.92 to an estimated 1.08.';
      if (lower.includes('tax')) reply = 'Tax opportunities: You have ₹85,200 in LTCG gains. The LTCG exemption limit is ₹1,25,000. You can book additional ₹39,800 in LTCG without any tax liability. Consider selling and re-buying to reset the cost basis.';
      this.messages.push({ role: 'ai', text: reply, time: this.nowTime() });
    }, 1200);
  }
}
