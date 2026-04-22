import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WatchStock { symbol: string; name: string; price: number; change: number; changePct: number; low52: number; high52: number; marketCap: string; note: string; }

@Component({
    selector: 'we-watchlist',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">Watchlist</h1>
          <p class="text-gray-500 text-xs">Track stocks you are interested in</p>
        </div>
        <button (click)="showAdd=true" class="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Stock
        </button>
      </div>

      <!-- Market Snapshot -->
      <div class="grid grid-cols-4 gap-3">
        <div *ngFor="let m of markets" class="bg-[#0d1120] border border-gray-800/60 rounded-xl p-3">
          <p class="text-[10px] text-gray-500 font-medium">{{ m.name }}</p>
          <p class="text-base font-bold text-white mt-0.5">{{ m.value }}</p>
          <p class="text-[10px] font-semibold mt-0.5" [class.text-wealth-green]="m.up" [class.text-wealth-red]="!m.up">{{ m.change }}</p>
        </div>
      </div>

      <!-- Watchlist Table -->
      <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="relative">
            <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input [(ngModel)]="searchTerm" placeholder="Search stocks..." class="pl-7 pr-3 py-1.5 bg-gray-900 border border-gray-700 rounded-xl text-[10px] text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-44">
          </div>
        </div>

        <!-- Column headers -->
        <div class="grid watch-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-gray-800/60">
          <div>Name</div>
          <div class="text-right">Price</div>
          <div class="text-right">Change</div>
          <div class="text-right">52W Range</div>
          <div class="text-right">Market Cap</div>
          <div>Notes</div>
          <div class="text-right">Action</div>
        </div>

        <!-- Rows -->
        <div class="mt-1 space-y-0.5">
          <div *ngFor="let s of filtered" class="grid watch-grid px-2 py-3 rounded-xl hover:bg-gray-800/40 transition-colors group items-center">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0">{{ s.symbol.substring(0,3) }}</div>
              <div>
                <p class="text-[10px] font-semibold text-white">{{ s.name }}</p>
                <p class="text-[9px] text-gray-500">{{ s.symbol }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-semibold text-white">₹{{ s.price | number:'1.0-0' }}</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-semibold" [class.text-wealth-green]="s.change>=0" [class.text-wealth-red]="s.change<0">
                {{ s.change>=0?'+':'' }}₹{{ s.change | number:'1.0-0' }} ({{ s.changePct | number:'1.2-2' }}%)
              </p>
            </div>
            <div class="text-right">
              <p class="text-[9px] text-gray-400">₹{{ s.low52 | number:'1.0-0' }} – ₹{{ s.high52 | number:'1.0-0' }}</p>
              <div class="w-20 h-1 bg-gray-800 rounded-full overflow-hidden mt-1 ml-auto">
                <div class="h-full bg-indigo-500 rounded-full" [style.width.%]="((s.price-s.low52)/(s.high52-s.low52))*100"></div>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-gray-300">{{ s.marketCap }}</p>
            </div>
            <div>
              <p class="text-[9px] text-gray-500 italic truncate max-w-32">{{ s.note }}</p>
            </div>
            <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold">Analyze</button>
              <button (click)="remove(s)" class="w-5 h-5 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 transition-colors">
                <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Stock Modal -->
      <div *ngIf="showAdd" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" (click)="showAdd=false">
        <div class="bg-[#0d1120] border border-gray-800 rounded-2xl p-5 w-72 mx-4" (click)="$event.stopPropagation()">
          <h3 class="text-sm font-bold text-white mb-3">Add to Watchlist</h3>
          <div class="space-y-2.5">
            <div><label class="text-[10px] text-gray-400 mb-1 block">Symbol / Ticker</label><input class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. HDFCBANK" [(ngModel)]="newSymbol"></div>
            <div><label class="text-[10px] text-gray-400 mb-1 block">Notes</label><input class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="Why are you watching this?" [(ngModel)]="newNote"></div>
          </div>
          <div class="flex gap-2 mt-4">
            <button (click)="showAdd=false" class="flex-1 py-2 rounded-xl bg-gray-800 text-xs text-gray-300 font-semibold">Cancel</button>
            <button (click)="addStock()" class="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">Add</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`.watch-grid { display:grid; grid-template-columns:2fr 0.8fr 1fr 1.2fr 0.7fr 1.2fr 0.7fr; align-items:center; column-gap:8px; }`]
})
export class WatchlistComponent {
    searchTerm = ''; showAdd = false; newSymbol = ''; newNote = '';

    markets = [
        { name: 'NIFTY 50', value: '22,945.30', change: '+0.85%', up: true },
        { name: 'SENSEX', value: '75,231.18', change: '+0.78%', up: true },
        { name: 'BANK NIFTY', value: '48,814.25', change: '+0.61%', up: true },
        { name: 'NIFTY MIDCAP', value: '47,195.10', change: '-0.12%', up: false },
    ];

    stocks: WatchStock[] = [
        { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 774.85, change: 21.30, changePct: 2.83, low52: 459, high52: 1179, marketCap: '₹286.7B', note: 'EV growth story' },
        { symbol: 'TITAN', name: 'Titan Company', price: 3152.40, change: -9.05, changePct: -0.29, low52: 2590, high52: 3850, marketCap: '₹278.1B', note: 'Strong brand moat' },
        { symbol: 'LT', name: 'Larsen & Toubro', price: 3588.30, change: 44.55, changePct: 1.26, low52: 2779, high52: 3963, marketCap: '₹494.8B', note: 'Infra + defence' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1724.80, change: -19.45, changePct: -1.11, low52: 1291, high52: 1880, marketCap: '₹1.3T', note: 'Consistent performer' },
        { symbol: 'ZOMATO', name: 'Zomato', price: 220.45, change: -3.85, changePct: -1.72, low52: 120, high52: 303, marketCap: '₹199.2B', note: 'Blinkit re-rating' },
    ];

    get filtered() { return this.stocks.filter(s => !this.searchTerm || s.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || s.symbol.toLowerCase().includes(this.searchTerm.toLowerCase())); }
    remove(s: WatchStock) { this.stocks = this.stocks.filter(x => x !== s); }
    addStock() { if (this.newSymbol) { this.stocks.push({ symbol: this.newSymbol.toUpperCase(), name: this.newSymbol.toUpperCase(), price: 0, change: 0, changePct: 0, low52: 0, high52: 0, marketCap: '--', note: this.newNote }); this.showAdd = false; this.newSymbol = ''; this.newNote = ''; } }
}
