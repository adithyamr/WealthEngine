import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendationDto } from '../../core/services/portfolio.service';

@Component({
    selector: 'we-daily-recs',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-wealth-card rounded-2xl border border-gray-800 p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">AI Daily Picks</h2>
        <span class="text-xs text-gray-500">Powered by TIER 3 Agent</span>
      </div>

      <div *ngIf="recommendations.length === 0" class="text-center text-gray-500 py-8">
        <div class="text-4xl mb-3">🤖</div>
        <p class="text-sm">No recommendations yet.</p>
        <p class="text-xs mt-1">Use the Live Console to analyze stocks and they'll appear here.</p>
      </div>

      <div class="space-y-3">
        <div *ngFor="let rec of recommendations"
             class="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-200 cursor-pointer group">

          <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center font-mono font-bold text-sm"
               [style.border-color]="getActionColor(rec.action)" style="border: 2px solid">
            {{ rec.ticker.substring(0, 4) }}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-white">{{ rec.ticker }}</span>
              <span [class]="getActionBadgeClass(rec.action)" class="text-xs px-2 py-0.5 rounded-full font-bold">
                {{ rec.action.replace('_', ' ') }}
              </span>
            </div>
            <p class="text-xs text-gray-400 truncate">{{ rec.reasoning?.substring(0, 80) }}...</p>
          </div>

          <div class="flex-shrink-0 text-right">
            <div class="text-sm font-semibold" [class]="rec.riskLevel === 'HIGH' ? 'text-red-400' : rec.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'">
              {{ rec.riskLevel }}
            </div>
            <div class="text-xs text-gray-500">{{ (rec.confidenceScore * 100).toFixed(0) }}% conf.</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DailyRecsComponent {
    @Input() recommendations: RecommendationDto[] = [];

    getActionColor(action: string): string {
        const colors: Record<string, string> = {
            STRONG_BUY: '#10b981', BUY: '#34d399', HOLD: '#f59e0b', SELL: '#f87171', STRONG_SELL: '#ef4444'
        };
        return colors[action] || '#6b7280';
    }

    getActionBadgeClass(action: string): string {
        const classes: Record<string, string> = {
            STRONG_BUY: 'bg-green-900 text-green-300',
            BUY: 'bg-green-800 text-green-200',
            HOLD: 'bg-yellow-900 text-yellow-300',
            SELL: 'bg-red-800 text-red-200',
            STRONG_SELL: 'bg-red-900 text-red-300',
        };
        return classes[action] || 'bg-gray-800 text-gray-300';
    }
}
