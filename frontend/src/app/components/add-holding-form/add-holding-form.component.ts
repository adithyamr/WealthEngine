import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addHolding, updateHolding } from '../../store/holdings/holdings.actions';
import { AssetDto } from '../../core/services/portfolio.service';

interface AssetTypeConfig {
    label: string;
    icon: string;
    color: string;
    fields: string[];
    requiredFields?: string[];
}

const ASSET_CONFIGS: Record<string, AssetTypeConfig> = {
    STOCK: {
        label: 'Stocks', icon: '📈', color: 'bg-indigo-900/40 border-indigo-700/50',
        fields: ['symbol', 'name', 'quantity', 'purchasePrice', 'purchaseDate', 'exchange', 'sector', 'isin'],
        requiredFields: ['symbol', 'quantity', 'purchasePrice']
    },
    MUTUAL_FUND: {
        label: 'Mutual Fund', icon: '🏦', color: 'bg-violet-900/40 border-violet-700/50',
        fields: ['name', 'quantity', 'purchasePrice', 'purchaseDate', 'amfiCode', 'isin', 'sector'],
        requiredFields: ['quantity', 'purchasePrice']
    },
    ETF: {
        label: 'ETF', icon: '📊', color: 'bg-purple-900/40 border-purple-700/50',
        fields: ['symbol', 'name', 'quantity', 'purchasePrice', 'purchaseDate', 'exchange', 'isin'],
        requiredFields: ['symbol', 'quantity', 'purchasePrice']
    },
    FD: {
        label: 'Fixed Deposit', icon: '🏛️', color: 'bg-amber-900/40 border-amber-700/50',
        fields: ['name', 'purchasePrice', 'purchaseDate', 'interestRatePercent', 'maturityDate', 'maturityAmount', 'notes'],
        requiredFields: ['purchasePrice', 'interestRatePercent', 'maturityDate']
    },
    PPF: {
        label: 'PPF', icon: '🏦', color: 'bg-green-900/40 border-green-700/50',
        fields: ['name', 'purchasePrice', 'purchaseDate', 'interestRatePercent', 'maturityDate', 'notes'],
        requiredFields: ['purchasePrice']
    },
    NPS: {
        label: 'NPS', icon: '🏛️', color: 'bg-emerald-900/40 border-emerald-700/50',
        fields: ['name', 'symbol', 'quantity', 'purchasePrice', 'purchaseDate', 'sector', 'notes'],
        requiredFields: ['purchasePrice']
    },
    EPF: {
        label: 'EPF / PF', icon: '💼', color: 'bg-teal-900/40 border-teal-700/50',
        fields: ['name', 'purchasePrice', 'purchaseDate', 'interestRatePercent', 'notes'],
        requiredFields: ['purchasePrice']
    },
    BONDS: {
        label: 'Bonds', icon: '📜', color: 'bg-yellow-900/40 border-yellow-700/50',
        fields: ['symbol', 'name', 'quantity', 'purchasePrice', 'purchaseDate', 'interestRatePercent', 'maturityDate', 'maturityAmount', 'isin'],
        requiredFields: ['quantity', 'purchasePrice', 'interestRatePercent']
    },
    GOLD: {
        label: 'Gold', icon: '🥇', color: 'bg-yellow-900/40 border-yellow-700/50',
        fields: ['name', 'quantity', 'purchasePrice', 'purchaseDate', 'notes'],
        requiredFields: ['quantity', 'purchasePrice']
    },
    CASH: {
        label: 'Cash / Savings', icon: '💵', color: 'bg-slate-700/40 border-slate-600/50',
        fields: ['name', 'purchasePrice', 'purchaseDate', 'interestRatePercent', 'notes'],
        requiredFields: ['purchasePrice']
    },
    CRYPTO: {
        label: 'Crypto', icon: '🪙', color: 'bg-orange-900/40 border-orange-700/50',
        fields: ['symbol', 'name', 'quantity', 'purchasePrice', 'purchaseDate', 'notes'],
        requiredFields: ['symbol', 'quantity', 'purchasePrice']
    },
};

const FIELD_LABELS: Record<string, { label: string; placeholder: string; type?: string; hint?: string }> = {
    symbol: { label: 'Ticker / Symbol', placeholder: 'e.g. INFY, RELIANCE', type: 'text', hint: 'NSE/BSE ticker or PRAN for NPS' },
    name: { label: 'Name', placeholder: 'e.g. Infosys Ltd / HDFC Bank FD / Mahindra PPF', type: 'text' },
    quantity: { label: 'Quantity / Units', placeholder: 'e.g. 100 shares, 500.25 units', type: 'number', hint: 'Shares for stocks, units for MF/ETF, grams for gold' },
    purchasePrice: { label: 'Purchase Price / Principal (₹)', placeholder: 'e.g. 1450.00', type: 'number', hint: 'NAV for MF, price per share for stocks, principal for FD' },
    purchaseDate: { label: 'Purchase / Investment Date', placeholder: '', type: 'date' },
    exchange: { label: 'Exchange', placeholder: 'NSE or BSE', type: 'select', hint: 'Stock exchange where listed' },
    sector: { label: 'Sector / Category', placeholder: 'e.g. IT, Banking, Healthcare, Large Cap', type: 'text', hint: 'For stocks: sector; for MF: fund category' },
    isin: { label: 'ISIN', placeholder: 'e.g. INE009A01021', type: 'text', hint: '12-character ISIN code' },
    amfiCode: { label: 'AMFI / Scheme Code', placeholder: 'e.g. 100330', type: 'text', hint: 'AMFI scheme code for Mutual Funds' },
    interestRatePercent: { label: 'Interest Rate (% p.a.)', placeholder: 'e.g. 7.1', type: 'number', hint: 'Annual interest rate for FD/PPF/Bonds' },
    maturityDate: { label: 'Maturity Date', placeholder: '', type: 'date', hint: 'When the instrument matures' },
    maturityAmount: { label: 'Projected Maturity Amount (₹)', placeholder: 'e.g. 150000', type: 'number', hint: 'Expected proceeds at maturity' },
    notes: { label: 'Notes / Reference', placeholder: 'e.g. PRAN 110123456789, UAN 101234567890', type: 'text', hint: 'NPS PRAN, EPF UAN, bank account number etc.' },
};

@Component({
    selector: 'we-add-holding-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="onOverlayClick($event)">
      <div class="bg-wealth-card border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slide-up" (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-700">
          <div class="flex items-center gap-3">
            <span class="text-2xl" *ngIf="selectedType">{{ assetConfigs[selectedType]?.icon }}</span>
            <div>
              <h2 class="text-lg font-bold text-white">{{ editMode ? 'Edit Holding' : 'Add Holding' }}</h2>
              <p class="text-xs text-gray-400">{{ selectedType ? assetConfigs[selectedType]?.label : 'Select asset type to continue' }}</p>
            </div>
          </div>
          <button (click)="cancel.emit()" class="text-gray-500 hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        <!-- Scrollable Form Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">

          <!-- Step 1: Asset type picker -->
          <div *ngIf="!editMode">
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Asset Type</label>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <button *ngFor="let type of assetTypeKeys" (click)="selectAssetType(type)"
                      [class]="selectedType === type
                        ? 'flex flex-col items-center p-3 rounded-xl border-2 border-wealth-accent bg-indigo-900/30 transition-all'
                        : 'flex flex-col items-center p-3 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-gray-500 transition-all'">
                <span class="text-xl mb-1">{{ assetConfigs[type].icon }}</span>
                <span class="text-xs text-gray-300 text-center font-medium leading-tight">{{ assetConfigs[type].label }}</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Dynamic fields based on asset type -->
          <form *ngIf="form && selectedType" [formGroup]="form" class="space-y-4">

            <!-- name is always first -->
            <div *ngIf="hasField('name')">
              <label class="we-field-label">{{ fieldInfo('name').label }}*</label>
              <input formControlName="name" type="text" class="we-input" [placeholder]="fieldInfo('name').placeholder"/>
              <p class="we-field-hint" *ngIf="fieldInfo('name').hint">{{ fieldInfo('name').hint }}</p>
              <p class="we-error" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Name is required</p>
            </div>

            <!-- symbol -->
            <div *ngIf="hasField('symbol')">
              <label class="we-field-label">{{ fieldInfo('symbol').label }}<span *ngIf="isRequired('symbol')">*</span></label>
              <input formControlName="symbol" type="text" class="we-input uppercase" [placeholder]="fieldInfo('symbol').placeholder"/>
              <p class="we-field-hint" *ngIf="fieldInfo('symbol').hint">{{ fieldInfo('symbol').hint }}</p>
            </div>

            <!-- Two-column row: quantity + purchasePrice -->
            <div class="grid grid-cols-2 gap-3" *ngIf="hasField('quantity') || hasField('purchasePrice')">
              <div *ngIf="hasField('quantity')">
                <label class="we-field-label">{{ fieldInfo('quantity').label }}<span *ngIf="isRequired('quantity')">*</span></label>
                <input formControlName="quantity" type="number" step="any" class="we-input" [placeholder]="fieldInfo('quantity').placeholder"/>
                <p class="we-field-hint" *ngIf="fieldInfo('quantity').hint">{{ fieldInfo('quantity').hint }}</p>
              </div>
              <div *ngIf="hasField('purchasePrice')">
                <label class="we-field-label">{{ fieldInfo('purchasePrice').label }}*</label>
                <input formControlName="purchasePrice" type="number" step="any" class="we-input" [placeholder]="fieldInfo('purchasePrice').placeholder"/>
                <p class="we-field-hint" *ngIf="fieldInfo('purchasePrice').hint">{{ fieldInfo('purchasePrice').hint }}</p>
              </div>
            </div>

            <!-- purchaseDate -->
            <div *ngIf="hasField('purchaseDate')">
              <label class="we-field-label">{{ fieldInfo('purchaseDate').label }}*</label>
              <input formControlName="purchaseDate" type="date" class="we-input" [max]="today"/>
            </div>

            <!-- exchange -->
            <div *ngIf="hasField('exchange')">
              <label class="we-field-label">{{ fieldInfo('exchange').label }}</label>
              <select formControlName="exchange" class="we-input">
                <option value="">Select exchange</option>
                <option value="NSE">NSE – National Stock Exchange</option>
                <option value="BSE">BSE – Bombay Stock Exchange</option>
              </select>
            </div>

            <!-- sector -->
            <div *ngIf="hasField('sector')">
              <label class="we-field-label">{{ fieldInfo('sector').label }}</label>
              <input formControlName="sector" type="text" class="we-input" [placeholder]="fieldInfo('sector').placeholder"/>
              <p class="we-field-hint" *ngIf="fieldInfo('sector').hint">{{ fieldInfo('sector').hint }}</p>
            </div>

            <!-- ISIN + amfiCode in a row -->
            <div class="grid grid-cols-2 gap-3" *ngIf="hasField('isin') || hasField('amfiCode')">
              <div *ngIf="hasField('isin')">
                <label class="we-field-label">{{ fieldInfo('isin').label }}</label>
                <input formControlName="isin" type="text" class="we-input" [placeholder]="fieldInfo('isin').placeholder" maxlength="12"/>
              </div>
              <div *ngIf="hasField('amfiCode')">
                <label class="we-field-label">{{ fieldInfo('amfiCode').label }}</label>
                <input formControlName="amfiCode" type="text" class="we-input" [placeholder]="fieldInfo('amfiCode').placeholder"/>
              </div>
            </div>

            <!-- Debt-specific: interest rate + maturity date -->
            <div class="grid grid-cols-2 gap-3" *ngIf="hasField('interestRatePercent') || hasField('maturityDate')">
              <div *ngIf="hasField('interestRatePercent')">
                <label class="we-field-label">{{ fieldInfo('interestRatePercent').label }}<span *ngIf="isRequired('interestRatePercent')">*</span></label>
                <input formControlName="interestRatePercent" type="number" step="0.01" class="we-input" [placeholder]="fieldInfo('interestRatePercent').placeholder"/>
                <p class="we-field-hint">{{ fieldInfo('interestRatePercent').hint }}</p>
              </div>
              <div *ngIf="hasField('maturityDate')">
                <label class="we-field-label">{{ fieldInfo('maturityDate').label }}<span *ngIf="isRequired('maturityDate')">*</span></label>
                <input formControlName="maturityDate" type="date" class="we-input"/>
              </div>
            </div>

            <!-- maturityAmount -->
            <div *ngIf="hasField('maturityAmount')">
              <label class="we-field-label">{{ fieldInfo('maturityAmount').label }}</label>
              <input formControlName="maturityAmount" type="number" step="any" class="we-input" [placeholder]="fieldInfo('maturityAmount').placeholder"/>
              <p class="we-field-hint">{{ fieldInfo('maturityAmount').hint }}</p>
            </div>

            <!-- notes -->
            <div *ngIf="hasField('notes')">
              <label class="we-field-label">{{ fieldInfo('notes').label }}</label>
              <input formControlName="notes" type="text" class="we-input" [placeholder]="fieldInfo('notes').placeholder"/>
              <p class="we-field-hint">{{ fieldInfo('notes').hint }}</p>
            </div>

            <!-- Error banner -->
            <div *ngIf="errorMessage" class="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300">
              {{ errorMessage }}
            </div>
          </form>
        </div>

        <!-- Footer actions -->
        <div class="border-t border-gray-700 p-4 flex gap-3 justify-end bg-gray-900/50">
          <button (click)="cancel.emit()" class="we-btn-ghost px-6">Cancel</button>
          <button (click)="submit()" [disabled]="!form || !selectedType || (saving$ | async)"
                  class="we-btn-primary px-6 disabled:opacity-40">
            <span *ngIf="!(saving$ | async)">{{ editMode ? '💾 Update' : '➕ Add Holding' }}</span>
            <span *ngIf="saving$ | async" class="flex items-center gap-2">
              <span class="animate-spin">⟳</span> Saving...
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .we-field-label { @apply block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5; }
    .we-field-hint  { @apply text-xs text-gray-600 mt-1; }
    .we-error       { @apply text-xs text-red-400 mt-1; }
  `]
})
export class AddHoldingFormComponent {
    @Input() editHolding: AssetDto | null = null;
    @Output() cancel = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    assetConfigs = ASSET_CONFIGS;
    assetTypeKeys = Object.keys(ASSET_CONFIGS);
    fieldInfo = (f: string) => FIELD_LABELS[f] || { label: f, placeholder: '' };

    selectedType: string | null = null;
    form: FormGroup | null = null;
    today = new Date().toISOString().split('T')[0];
    errorMessage = '';
    saving$ = this.store.select((s: any) => s.holdings?.saving || false);

    get editMode() { return !!this.editHolding; }

    constructor(private fb: FormBuilder, private store: Store) { }

    ngOnInit() {
        if (this.editHolding) {
            this.selectedType = this.editHolding.assetType;
            this.buildForm(this.editHolding);
        }
    }

    selectAssetType(type: string) {
        this.selectedType = type;
        this.buildForm();
    }

    hasField(field: string): boolean {
        return !!this.selectedType && ASSET_CONFIGS[this.selectedType]?.fields.includes(field);
    }

    isRequired(field: string): boolean {
        return !!this.selectedType && (ASSET_CONFIGS[this.selectedType]?.requiredFields || []).includes(field);
    }

    private buildForm(prefill?: AssetDto) {
        const controls: Record<string, any> = {
            name: [prefill?.name || '', Validators.required],
            symbol: [prefill?.symbol || ''],
            quantity: [prefill?.quantity || null],
            purchasePrice: [prefill?.purchasePrice || null, Validators.required],
            purchaseDate: [prefill?.purchaseDate || this.today, Validators.required],
            exchange: [prefill?.exchange || ''],
            sector: [prefill?.sector || ''],
            isin: [prefill?.isin || ''],
            amfiCode: [prefill?.amfiCode || ''],
            interestRatePercent: [prefill?.interestRatePercent || null],
            maturityDate: [prefill?.maturityDate || null],
            maturityAmount: [prefill?.maturityAmount || null],
            notes: [prefill?.notes || ''],
        };
        this.form = this.fb.group(controls);
    }

    submit() {
        if (!this.form || !this.selectedType) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) { this.errorMessage = 'Please fill in all required fields.'; return; }

        this.errorMessage = '';
        const raw = this.form.value;

        const request: any = {
            assetType: this.selectedType,
            name: raw.name,
            purchasePrice: raw.purchasePrice,
            purchaseDate: raw.purchaseDate,
        };

        // Only include fields relevant to this asset type
        const config = ASSET_CONFIGS[this.selectedType];
        config.fields.forEach(field => {
            if (field !== 'name' && field !== 'purchasePrice' && field !== 'purchaseDate') {
                const val = raw[field];
                if (val !== null && val !== undefined && val !== '') request[field] = val;
            }
        });

        if (this.editHolding) {
            this.store.dispatch(updateHolding({ id: this.editHolding.id!, request: { ...request, assetType: this.selectedType } }));
        } else {
            this.store.dispatch(addHolding({ request }));
        }
        this.saved.emit();
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement) === event.currentTarget) {
            this.cancel.emit();
        }
    }
}
