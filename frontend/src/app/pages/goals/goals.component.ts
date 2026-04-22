import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Goal { id: number; name: string; icon: string; current: number; target: number; expectedDate: string; status: 'on-track' | 'at-risk' | 'completed'; monthlyReq: number; }

@Component({
    selector: 'we-goals',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-white">Goals</h1>
          <p class="text-gray-500 text-xs">Track your financial goals and stay on target</p>
        </div>
        <button (click)="showAdd=true" class="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Goal
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2">
        <button *ngFor="let t of ['All Goals','In Progress','Completed']" (click)="tab=t"
          [class]="tab===t?'px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25':'px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-800 text-gray-500 hover:text-gray-300 border border-transparent transition-colors'">
          {{ t }}
        </button>
      </div>

      <!-- Goal Cards -->
      <div class="space-y-3">
        <div *ngFor="let g of filteredGoals" class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-4 hover:border-gray-700/60 transition-colors">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-900/40 border border-indigo-700/30 flex items-center justify-center text-xl">{{ g.icon }}</div>
              <div>
                <p class="text-sm font-semibold text-white">{{ g.name }}</p>
                <p class="text-[10px] text-gray-500">Expected: {{ g.expectedDate }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" [ngClass]="g.status==='completed'?'bg-emerald-900/50 text-emerald-400':g.status==='on-track'?'bg-blue-900/50 text-blue-400':'bg-red-900/50 text-red-400'">
                {{ g.status==='on-track' ? 'On Track' : g.status==='completed' ? 'Completed' : 'At Risk' }} {{ g.status!=='at-risk'?'→':'' }}
              </span>
              <button class="text-[10px] text-gray-500 hover:text-white transition-colors">⋮</button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-3">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-3">
                <div class="h-2.5 bg-gray-800 rounded-full overflow-hidden w-64">
                  <div class="h-full rounded-full transition-all duration-500"
                    [style.width.%]="(g.current/g.target)*100"
                    [ngClass]="g.status==='completed'?'bg-emerald-500':g.status==='on-track'?'bg-indigo-500':'bg-amber-500'"></div>
                </div>
                <span class="text-[10px] text-gray-400 font-semibold">{{ (g.current/g.target)*100 | number:'1.0-0' }}%</span>
              </div>
              <span class="text-[10px] text-gray-500">₹{{ g.current | number:'1.0-0' }} / ₹{{ g.target | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 pt-3 border-t border-gray-800/50">
            <div>
              <p class="text-[9px] text-gray-500 mb-0.5">Monthly Required</p>
              <p class="text-xs font-bold text-white">₹{{ g.monthlyReq | number:'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-[9px] text-gray-500 mb-0.5">Remaining</p>
              <p class="text-xs font-bold text-white">₹{{ (g.target - g.current) | number:'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-[9px] text-gray-500 mb-0.5">Target Date</p>
              <p class="text-xs font-bold text-white">{{ g.expectedDate }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Goal Planner -->
      <div class="bg-[#0d1120] border border-indigo-700/20 rounded-2xl p-4">
        <h3 class="text-sm font-bold text-white mb-3">Goal Planner</h3>
        <div class="grid grid-cols-4 gap-4">
          <div *ngFor="let s of plannerStats" class="text-center">
            <p class="text-[10px] text-gray-500 mb-1">{{ s.label }}</p>
            <p class="text-base font-extrabold" [ngClass]="s.color">{{ s.value }}</p>
          </div>
        </div>
        <div class="mt-3 p-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl">
          <p class="text-[10px] text-indigo-300 font-semibold mb-1">💡 Suggestions to reach your goals faster</p>
          <ul class="text-[10px] text-gray-400 space-y-0.5 list-disc list-inside">
            <li>Move idle cash to debt funds</li>
            <li>Reduce high-risk allocation by 5%</li>
            <li>Increase SIP by ₹2,000/month</li>
          </ul>
        </div>
      </div>

      <!-- Add Goal Modal -->
      <div *ngIf="showAdd" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" (click)="showAdd=false">
        <div class="bg-[#0d1120] border border-gray-800 rounded-2xl p-5 w-80 mx-4" (click)="$event.stopPropagation()">
          <h3 class="text-sm font-bold text-white mb-3">Add New Goal</h3>
          <div class="space-y-2.5">
            <div><label class="text-[10px] text-gray-400 mb-1 block">Goal Name</label><input class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Home Down Payment" [(ngModel)]="newGoal.name"></div>
            <div><label class="text-[10px] text-gray-400 mb-1 block">Target Amount (₹)</label><input type="number" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="500000" [(ngModel)]="newGoal.target"></div>
            <div><label class="text-[10px] text-gray-400 mb-1 block">Target Date</label><input type="date" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" [(ngModel)]="newGoal.date"></div>
          </div>
          <div class="flex gap-2 mt-4">
            <button (click)="showAdd=false" class="flex-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-semibold">Cancel</button>
            <button (click)="addGoal()" class="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">Add Goal</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GoalsComponent {
    tab = 'All Goals';
    showAdd = false;
    newGoal = { name: '', target: 0, date: '' };

    goals: Goal[] = [
        { id: 1, name: 'Loan Repayment', icon: '🏠', current: 50000, target: 100000, expectedDate: 'Mar 26', status: 'on-track', monthlyReq: 15000 },
        { id: 2, name: 'Emergency Fund', icon: '🛡️', current: 100000, target: 300000, expectedDate: 'Dec 25', status: 'on-track', monthlyReq: 23400 },
        { id: 3, name: 'Europe Vacation', icon: '✈️', current: 50172, target: 100000, expectedDate: 'Feb 26', status: 'on-track', monthlyReq: 8400 },
        { id: 4, name: 'Retirement Corpus', icon: '🏦', current: 389500, target: 5000000, expectedDate: 'Jan 45', status: 'on-track', monthlyReq: 12000 },
    ];

    plannerStats = [
        { label: 'Monthly Required', value: '₹15,000', color: 'text-white' },
        { label: 'Required Monthly', value: '₹23,400', color: 'text-wealth-green' },
        { label: 'Time', value: 'Due', color: 'text-gray-400' },
        { label: 'Monthly Budget', value: '₹8,400', color: 'text-wealth-gold' },
    ];

    get filteredGoals() {
        if (this.tab === 'In Progress') return this.goals.filter(g => g.status !== 'completed');
        if (this.tab === 'Completed') return this.goals.filter(g => g.status === 'completed');
        return this.goals;
    }

    addGoal() {
        if (this.newGoal.name) {
            this.goals.push({ id: Date.now(), name: this.newGoal.name, icon: '🎯', current: 0, target: this.newGoal.target || 100000, expectedDate: this.newGoal.date, status: 'on-track', monthlyReq: 0 });
            this.showAdd = false;
            this.newGoal = { name: '', target: 0, date: '' };
        }
    }
}
