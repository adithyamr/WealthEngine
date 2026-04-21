import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AddHoldingFormComponent } from '../../components/add-holding-form/add-holding-form.component';
import { loadHoldings, deleteHolding, setSelectedType } from '../../store/holdings/holdings.actions';
import {
  selectFilteredHoldings,
  selectHoldingsLoading,
  selectHoldingsByType,
  selectSelectedType,
  selectTotalByType
} from '../../store/holdings/holdings.selectors';
import { AssetDto } from '../../core/services/portfolio.service';
import { HoldingCardComponent } from '../../components/holding-card/holding-card.component';

const ASSET_ICONS: Record<string, string> = {
  STOCK: '📈', MUTUAL_FUND: '🏦', ETF: '📊', FD: '🏛️', PPF: '💰',
  NPS: '🏛️', EPF: '💼', BONDS: '📜', GOLD: '🥇', CASH: '💵', CRYPTO: '🪙'
};
const ASSET_LABELS: Record<string, string> = {
  STOCK: 'Stocks', MUTUAL_FUND: 'Mutual Funds', ETF: 'ETFs', FD: 'Fixed Deposits',
  PPF: 'PPF', NPS: 'NPS', EPF: 'EPF / PF', BONDS: 'Bonds', GOLD: 'Gold', CASH: 'Cash', CRYPTO: 'Crypto'
};

@Component({
  selector: 'we-holdings',
  standalone: true,
  imports: [CommonModule, AddHoldingFormComponent, HoldingCardComponent],
  template: `
    <div class="space-y-6">

      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-white">My Holdings</h1>
          <p class="text-gray-400 text-sm">Track all your investments across asset classes</p>
        </div>
        <button (click)="showAddForm = true"
                class="we-btn-primary flex items-center gap-2">
          <span class="text-lg">+</span> Add Holding
        </button>
      </div>

      <!-- Asset Type Filter Tabs -->
      <div *ngIf="(holdingsByType$ | async) as byType" class="flex gap-2 flex-wrap">
        <button (click)="filterType(null)"
                [class]="(selectedType$ | async) === null
                  ? 'px-4 py-2 rounded-xl text-sm font-semibold bg-wealth-accent text-white'
                  : 'px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors'">
          All ({{ (allHoldings$ | async)?.length || 0 }})
        </button>
        <button *ngFor="let type of getActiveTypes(byType)"
                (click)="filterType(type)"
                [class]="(selectedType$ | async) === type
                  ? 'px-4 py-2 rounded-xl text-sm font-semibold bg-wealth-accent text-white flex items-center gap-1.5'
                  : 'px-4 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center gap-1.5'">
          <span>{{ getIcon(type) }}</span>
          {{ getLabel(type) }}
          <span class="ml-1 text-xs opacity-70">({{ byType[type]?.length }})</span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3 text-gray-500">
          <div class="w-10 h-10 border-2 border-wealth-accent border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm">Loading holdings...</span>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!(loading$ | async) && (allHoldings$ | async)?.length === 0"
           class="we-card text-center py-16">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-lg font-semibold text-white mb-2">No holdings yet</h3>
        <p class="text-gray-400 text-sm mb-6">Add your first investment to start tracking your portfolio</p>
        <button (click)="showAddForm = true" class="we-btn-primary">
          ➕ Add First Holding
        </button>
      </div>

      <!-- Holdings Cards by Group -->
      <div *ngIf="!(loading$ | async) && (allHoldings$ | async)?.length !== 0 && (holdingsByType$ | async) as byType">

        <!-- If filtered: show flat list -->
        <div *ngIf="(selectedType$ | async) as type">
          <div class="space-y-3">
            <we-holding-card *ngFor="let h of filteredHoldings$ | async" [holding]="h"
              (edit)="onEdit(h)" (delete)="onDelete(h.id!)">
            </we-holding-card>
          </div>
        </div>

        <!-- If all: group by type -->
        <div *ngIf="!(selectedType$ | async)" class="space-y-8">
          <div *ngFor="let type of getActiveTypes(byType)">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">{{ getIcon(type) }}</span>
              <h3 class="font-semibold text-white">{{ getLabel(type) }}</h3>
              <span class="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {{ byType[type]?.length }} holdings
              </span>
              <span class="ml-auto text-sm font-semibold text-wealth-green">
                ₹{{ getTotalForType(totalsByType$ | async, type) | number:'1.0-0' }}
              </span>
            </div>
            <div class="space-y-2">
              <we-holding-card *ngFor="let h of byType[type]" [holding]="h" (edit)="onEdit(h)" (delete)="onDelete(h.id!)" class="w-full"></we-holding-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Holding Modal -->
      <we-add-holding-form *ngIf="showAddForm"
        (cancel)="showAddForm = false"
        (saved)="onSaved()">
      </we-add-holding-form>

      <!-- Edit Holding Modal -->
      <we-add-holding-form *ngIf="editingHolding"
        [editHolding]="editingHolding"
        (cancel)="editingHolding = null"
        (saved)="editingHolding = null">
      </we-add-holding-form>

      <!-- Delete confirm -->
      <div *ngIf="confirmDeleteId"
           class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div class="we-card max-w-sm w-full mx-4 animate-slide-up">
          <h3 class="text-lg font-bold text-white mb-2">Delete Holding?</h3>
          <p class="text-gray-400 text-sm mb-6">This holding will be soft-deleted. Transaction history is preserved.</p>
          <div class="flex gap-3 justify-end">
            <button (click)="confirmDeleteId = null" class="we-btn-ghost">Cancel</button>
            <button (click)="confirmDelete()" class="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HoldingsComponent implements OnInit {
  showAddForm = false;
  editingHolding: AssetDto | null = null;
  confirmDeleteId: number | null = null;

  allHoldings$: Observable<AssetDto[]>;
  filteredHoldings$: Observable<AssetDto[]>;
  holdingsByType$: Observable<Record<string, AssetDto[]>>;
  totalsByType$: Observable<Record<string, number>>;
  selectedType$: Observable<string | null>;
  loading$: Observable<boolean>;

  getIcon = (t: string) => ASSET_ICONS[t] || '💼';
  getLabel = (t: string) => ASSET_LABELS[t] || t;

  constructor(private store: Store) {
    this.allHoldings$ = this.store.select(selectFilteredHoldings);
    this.filteredHoldings$ = this.store.select(selectFilteredHoldings);
    this.holdingsByType$ = this.store.select(selectHoldingsByType);
    this.totalsByType$ = this.store.select(selectTotalByType);
    this.selectedType$ = this.store.select(selectSelectedType);
    this.loading$ = this.store.select(selectHoldingsLoading);
  }

  ngOnInit() {
    this.store.dispatch(loadHoldings());
  }

  getActiveTypes(byType: Record<string, any[]>): string[] {
    return Object.keys(byType).filter(t => byType[t]?.length > 0);
  }

  getTotalForType(totals: Record<string, number> | null, type: string): number {
    return totals?.[type] || 0;
  }

  getQuantityUnit(assetType: string): string {
    const units: Record<string, string> = {
      STOCK: 'shares', ETF: 'units', MUTUAL_FUND: 'units',
      GOLD: 'grams', CRYPTO: 'coins/tokens', BONDS: 'units'
    };
    return units[assetType] || '';
  }

  filterType(type: string | null) {
    this.store.dispatch(setSelectedType({ assetType: type }));
  }

  onEdit(holding: AssetDto) {
    this.editingHolding = { ...holding };
  }

  onDelete(id: number) {
    this.confirmDeleteId = id;
  }

  confirmDelete() {
    if (this.confirmDeleteId) {
      this.store.dispatch(deleteHolding({ id: this.confirmDeleteId }));
      this.confirmDeleteId = null;
    }
  }

  onSaved() {
    this.showAddForm = false;
    this.store.dispatch(loadHoldings());
  }
}
