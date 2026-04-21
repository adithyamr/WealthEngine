import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetDto } from '../../core/services/portfolio.service';

@Component({
    selector: 'we-holding-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="we-card !p-4 hover:border-gray-600 transition-colors group">
      <div class="flex items-center gap-4">
        <!-- Identity -->
        <div class="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-gray-700">
          {{ ((holding.symbol || holding.name)?.substring(0, 3) || '') .toUpperCase() }}
        </div>

        <!-- Main info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-white truncate">{{ holding.name }}</span>
            <span *ngIf="holding.symbol" class="text-xs text-gray-500 font-mono">{{ holding.symbol }}</span>
          </div>
          <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span *ngIf="holding.quantity">{{ holding.quantity | number:'1.0-4' }} {{ getQuantityUnit(holding.assetType) }}</span>
            <span *ngIf="holding.exchange" class="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{{ holding.exchange }}</span>
            <span *ngIf="holding.sector" class="text-gray-500">{{ holding.sector }}</span>
            <span *ngIf="holding.interestRatePercent" class="text-amber-400">{{ holding.interestRatePercent }}% p.a.</span>
            <span *ngIf="holding.maturityDate" class="text-gray-500">Matures: {{ holding.maturityDate }}</span>
          </div>
          <div *ngIf="holding.notes" class="text-xs text-gray-600 mt-0.5 truncate">{{ holding.notes }}</div>
        </div>

        <!-- Values -->
        <div class="text-right flex-shrink-0">
          <div class="font-bold text-white">₹{{ (holding.currentValue || holding.investedValue) | number:'1.0-0' }}</div>
          <div class="text-xs mt-0.5"
               [class]="(holding.gainLoss || 0) >= 0 ? 'text-wealth-green' : 'text-wealth-red'">
            {{ (holding.gainLoss || 0) >= 0 ? '+' : '' }}{{ (holding.gainLossPercent || 0) | number:'1.2-2' }}%
            ({{ (holding.gainLoss || 0) >= 0 ? '+₹' : '-₹' }}{{ (holding.gainLoss || 0) | number:'1.0-0' }})
          </div>
          <div class="text-xs text-gray-600">Cost: ₹{{ holding.investedValue | number:'1.0-0' }}</div>
        </div>

        <!-- Actions (visible on hover) -->
        <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <button (click)="edit.emit(); $event.stopPropagation()"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs transition-colors"
                  title="Edit">✏️</button>
          <button (click)="delete.emit(); $event.stopPropagation()"
                  class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-400 text-xs transition-colors"
                  title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  `
})
export class HoldingCardComponent {
    @Input() holding!: AssetDto;
    @Output() edit = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();

    getQuantityUnit(assetType: string): string {
        const units: Record<string, string> = {
            STOCK: 'shares', ETF: 'units', MUTUAL_FUND: 'units',
            GOLD: 'grams', CRYPTO: 'coins/tokens', BONDS: 'units'
        };
        return units[assetType] || '';
    }
}
