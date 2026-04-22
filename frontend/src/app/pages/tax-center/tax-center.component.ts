import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'we-tax-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">Tax Center</h1>
          <p class="text-gray-500 text-xs">Track and optimize your investment taxes</p>
        </div>
        <span class="text-[10px] font-semibold bg-indigo-900/40 text-indigo-400 border border-indigo-700/30 px-2.5 py-1 rounded-xl">Financial Year: 2024-25</span>
      </div>

      <div class="flex gap-2">
        <button *ngFor="let t of tabs" (click)="tab=t"
          [class]="tab===t?'px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25':'px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-800 text-gray-500 hover:text-gray-300 border border-transparent transition-colors'">
          {{ t }}
        </button>
      </div>

      <ng-container *ngIf="tab==='Capital Gains'">
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2 bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
            <h3 class="text-sm font-bold text-white mb-3">Capital Gains Summary</h3>
            <div class="grid cg-grid text-[9px] font-bold text-gray-500 uppercase tracking-wider px-2 pb-2 border-b border-gray-800/60">
              <div></div><div class="text-right">STCG</div><div class="text-right">LTCG</div><div class="text-right">Exemption</div><div class="text-right">Taxable</div><div class="text-right">Tax (Est.)</div>
            </div>
            <div *ngFor="let r of cgRows" class="grid cg-grid px-2 py-2.5 rounded-xl hover:bg-gray-800/30 transition-colors items-center">
              <p class="text-[10px] font-semibold text-gray-300">{{ r.type }}</p>
              <p class="text-[10px] text-right" [class.text-wealth-green]="r.stcg>0" [class.text-gray-500]="r.stcg===0">{{ r.stcg>0?'₹'+r.stcg:'--' }}</p>
              <p class="text-[10px] text-right" [class.text-wealth-green]="r.ltcg>0" [class.text-gray-500]="r.ltcg===0">{{ r.ltcg>0?'₹'+(r.ltcg|number:'1.0-0'):'--' }}</p>
              <p class="text-[10px] text-right text-gray-400">{{ r.exempt>0?'₹'+(r.exempt|number:'1.0-0'):'--' }}</p>
              <p class="text-[10px] text-right text-white font-semibold">₹{{ r.taxable|number:'1.0-0' }}</p>
              <p class="text-[10px] text-right text-wealth-red font-semibold">₹{{ r.tax|number:'1.0-0' }}</p>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-800/60 grid grid-cols-2 gap-3">
              <div class="bg-gray-900/50 rounded-xl p-3">
                <p class="text-[10px] text-gray-500 mb-1">Total Capital Gains (LTCG)</p>
                <p class="text-xl font-extrabold text-wealth-green">₹35,200</p>
                <p class="text-[9px] text-gray-500">Taxable &#64; 12.5% above 1.25L</p>
              </div>
              <div class="bg-gray-900/50 rounded-xl p-3">
                <p class="text-[10px] text-gray-500 mb-1">Total Tax Liability (Est.)</p>
                <p class="text-xl font-extrabold text-wealth-red">₹4,150</p>
                <p class="text-[9px] text-gray-500">Due by Jul 31, 2025</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="bg-[#0d1120] border border-emerald-700/20 rounded-2xl p-4">
              <p class="text-xs font-bold text-white mb-2">💡 Tax Saving Tip</p>
              <p class="text-[10px] text-gray-400 leading-relaxed">You can save up to <span class="text-emerald-400 font-bold">₹46,800</span> by investing in ELSS before 31st March.</p>
              <button class="mt-3 w-full py-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 text-[10px] font-semibold transition-all border border-emerald-800/30">Explore ELSS Funds →</button>
            </div>
            <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
              <p class="text-xs font-bold text-white mb-2">Section 80C Used</p>
              <div class="flex justify-between mb-1.5 text-[10px]"><span class="text-gray-400">₹1,20,000 / ₹1,50,000</span><span class="text-wealth-gold font-bold">80%</span></div>
              <div class="h-2 bg-gray-800 rounded-full overflow-hidden"><div class="h-full bg-wealth-gold rounded-full" style="width:80%"></div></div>
              <p class="text-[9px] text-gray-600 mt-1.5">Invest ₹30,000 more to maximize</p>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="tab==='Tax Saving Investments'">
        <div class="grid grid-cols-2 gap-4">
          <div *ngFor="let s of taxSaving" class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4">
            <div class="flex items-start gap-2 mb-2"><span class="text-xl">{{ s.icon }}</span><div><p class="text-xs font-semibold text-white">{{ s.name }}</p><p class="text-[10px] text-indigo-400">{{ s.section }}</p></div></div>
            <p class="text-[10px] text-gray-400 mb-2">{{ s.desc }}</p>
            <div class="flex justify-between text-[10px]"><span class="text-gray-500">Max Deduction</span><span class="text-white font-semibold">{{ s.limit }}</span></div>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="tab==='Tax Reports'">
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-10 text-center">
          <div class="text-4xl mb-3">📊</div>
          <p class="text-sm font-semibold text-white mb-1">Tax Reports</p>
          <p class="text-xs text-gray-500 mb-4">Generate your tax P&L statements for ITR filing</p>
          <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">Generate Tax P&L</button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`.cg-grid{display:grid;grid-template-columns:1.2fr .9fr .9fr .9fr .9fr .9fr;align-items:center;column-gap:8px;}`]
})
export class TaxCenterComponent {
  tabs = ['Capital Gains', 'Tax Saving Investments', 'Tax Reports'];
  tab = 'Capital Gains';
  cgRows = [
    { type: 'LTCG', stcg: 0, ltcg: 85200, exempt: 125000, taxable: 0, tax: 0 },
    { type: 'STCG', stcg: 7500, ltcg: 0, exempt: 0, taxable: 7500, tax: 1125 },
    { type: 'ELSS', stcg: 0, ltcg: 8400, exempt: 125000, taxable: 0, tax: 0 },
    { type: 'Total', stcg: 7500, ltcg: 93600, exempt: 125000, taxable: 7500, tax: 1125 },
  ];
  taxSaving = [
    { icon: '🏦', name: 'ELSS Mutual Funds', section: 'Section 80C', desc: 'Tax savings with equity growth potential. Lock-in: 3 years.', limit: '₹1,50,000' },
    { icon: '🏢', name: 'EPF / VPF', section: 'Section 80C', desc: 'Employee Provident Fund contributions.', limit: '₹1,50,000' },
    { icon: '🛡️', name: 'Term Insurance', section: 'Section 80C', desc: 'Life insurance premiums qualify for deduction.', limit: '₹1,50,000' },
    { icon: '🏥', name: 'Health Insurance', section: 'Section 80D', desc: 'Premium for self, family and parents.', limit: '₹75,000' },
    { icon: '📘', name: 'NPS Contribution', section: 'Section 80CCD', desc: 'Additional deduction on NPS investment.', limit: '₹50,000' },
    { icon: '🏠', name: 'Home Loan Interest', section: 'Section 24B', desc: 'Interest on home loan for self-occupied property.', limit: '₹2,00,000' },
  ];
}
