import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'we-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">Reports</h1>
          <p class="text-gray-500 text-xs">Generate and download your financial reports</p>
        </div>
        <button class="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Request Custom Report
        </button>
      </div>

      <!-- Report Cards -->
      <div class="grid grid-cols-3 gap-4">
        <div *ngFor="let r of reports" class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 hover:border-indigo-700/30 transition-colors group">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl border" [ngClass]="r.iconBg">{{ r.icon }}</div>
            <div class="flex-1">
              <p class="text-xs font-semibold text-white">{{ r.title }}</p>
              <p class="text-[10px] text-gray-500 mt-0.5">{{ r.desc }}</p>
            </div>
          </div>
          <button class="w-full py-2 rounded-xl bg-gray-800 hover:bg-indigo-600 text-gray-400 hover:text-white text-xs font-semibold transition-all group-hover:border-indigo-500/30 border border-transparent">
            Generate
          </button>
        </div>
      </div>

      <!-- Recent Reports -->
      <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
        <h3 class="text-sm font-bold text-white mb-3">Recent Reports</h3>
        <div class="space-y-2">
          <div *ngFor="let r of recent" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-800/40 transition-colors">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-indigo-900/40 flex items-center justify-center text-sm">📄</div>
              <div>
                <p class="text-[10px] font-semibold text-white">{{ r.name }}</p>
                <p class="text-[9px] text-gray-500">{{ r.date }} · {{ r.size }}</p>
              </div>
            </div>
            <button class="text-[9px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent {
    reports = [
        { icon: '📊', iconBg: 'bg-indigo-900/40 border-indigo-800/30', title: 'Portfolio Summary', desc: 'Overview of your entire portfolio' },
        { icon: '💰', iconBg: 'bg-green-900/40 border-green-800/30', title: 'Capital Gains Report', desc: 'Short-term & long-term gains data' },
        { icon: '💸', iconBg: 'bg-amber-900/40 border-amber-800/30', title: 'Dividend Report', desc: 'All income details' },
        { icon: '🥧', iconBg: 'bg-blue-900/40 border-blue-800/30', title: 'Asset Allocation Report', desc: 'Breakdown across asset classes' },
        { icon: '📈', iconBg: 'bg-purple-900/40 border-purple-800/30', title: 'XIRR Report', desc: 'All transactions analysis report' },
        { icon: '📋', iconBg: 'bg-red-900/40 border-red-800/30', title: 'Transaction Report', desc: 'All transactions in detail' },
    ];

    recent = [
        { name: 'Capital Gains Report – FY 2023-24', date: 'Apr 05, 2024', size: '1.2 MB' },
        { name: 'Portfolio Summary – Q4 FY24', date: 'Mar 31, 2024', size: '840 KB' },
        { name: 'XIRR Report – FY 2023-24', date: 'Mar 28, 2024', size: '560 KB' },
    ];
}
