import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Txn { date: string; type: string; asset: string; detail: string; qty: string; amount: number; status: 'success' | 'pending' | 'failed'; }

@Component({
    selector: 'we-transactions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">Transactions</h1>
          <p class="text-gray-500 text-xs">All transactions in your portfolio</p>
        </div>
        <button class="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-all">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export
        </button>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex gap-1.5">
          <button *ngFor="let f of typeFilters" (click)="typeFilter=f"
            [class]="typeFilter===f?'px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25':'px-2.5 py-1 rounded-xl text-xs font-medium bg-gray-800 text-gray-500 hover:text-gray-300 border border-transparent transition-colors'">
            {{ f }}
          </button>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <input type="date" [(ngModel)]="fromDate" class="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500">
          <span class="text-gray-600 text-[10px]">to</span>
          <input type="date" [(ngModel)]="toDate" class="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500">
        </div>
      </div>

      <!-- Table -->
      <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
        <div class="grid txn-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-gray-800/60">
          <div>Date</div><div>Type</div><div>Asset</div><div>Details</div><div class="text-right">Qty</div><div class="text-right">Amount</div><div class="text-right">Status</div>
        </div>
        <div class="mt-1 space-y-0.5">
          <div *ngFor="let t of filtered" class="grid txn-grid px-2 py-3 rounded-xl hover:bg-gray-800/30 transition-colors items-center">
            <p class="text-[10px] text-gray-400">{{ t.date }}</p>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit"
              [ngClass]="t.type==='Buy'?'bg-green-900/50 text-green-400':t.type==='Sell'?'bg-red-900/50 text-red-400':t.type==='SIP'?'bg-indigo-900/50 text-indigo-400':t.type==='Dividend'?'bg-amber-900/50 text-amber-400':'bg-blue-900/50 text-blue-400'">
              {{ t.type }}
            </span>
            <p class="text-[10px] font-semibold text-white truncate">{{ t.asset }}</p>
            <p class="text-[9px] text-gray-500 truncate">{{ t.detail }}</p>
            <p class="text-[10px] text-gray-300 text-right">{{ t.qty }}</p>
            <p class="text-[10px] font-semibold text-right" [class.text-wealth-green]="t.type==='Dividend'" [class.text-white]="t.type!=='Dividend'">₹{{ t.amount | number:'1.0-0' }}</p>
            <div class="text-right">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                [ngClass]="t.status==='success'?'bg-green-900/40 text-green-400':t.status==='pending'?'bg-amber-900/40 text-amber-400':'bg-red-900/40 text-red-400'">
                {{ t.status | titlecase }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`.txn-grid { display:grid; grid-template-columns:1fr 0.7fr 1.5fr 1.5fr 0.8fr 1fr 0.7fr; align-items:center; column-gap:8px; }`]
})
export class TransactionsComponent {
    typeFilter = 'All'; fromDate = ''; toDate = '';
    typeFilters = ['All', 'Buy', 'Sell', 'SIP', 'Dividend', 'FD'];

    transactions: Txn[] = [
        { date: '30 May 2024', type: 'SIP', asset: 'HDFC Top 100 Fund', detail: '500 Units @ ₹450', qty: '500 Units', amount: 450, status: 'success' },
        { date: '15 May 2024', type: 'Buy', asset: 'Reliance Industries', detail: '2 Shares @ ₹11,950', qty: '2 Shares', amount: 23900, status: 'success' },
        { date: '01 May 2024', type: 'SIP', asset: 'SBI Blue Cap Fund', detail: 'Dividend Received', qty: '--', amount: 1200, status: 'success' },
        { date: '28 Apr 2024', type: 'Dividend', asset: 'Coal India', detail: 'Dividend Q4 FY24', qty: '--', amount: 3200, status: 'success' },
        { date: '15 Apr 2024', type: 'SIP', asset: 'NIFTY 50 ETF', detail: '100 Units @ ₹100', qty: '100 Units', amount: 10000, status: 'success' },
        { date: '10 Apr 2024', type: 'FD', asset: 'SBI Fixed Deposit', detail: 'Reinvestment @7.5% p.a.', qty: '₹1,00,000', amount: 100000, status: 'success' },
        { date: '01 Apr 2024', type: 'SIP', asset: 'HDFC Top 100 Fund', detail: 'Monthly SIP installment', qty: '500 Units', amount: 450, status: 'pending' },
    ];

    get filtered() { return this.typeFilter === 'All' ? this.transactions : this.transactions.filter(t => t.type === this.typeFilter); }
}
