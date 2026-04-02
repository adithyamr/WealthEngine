import { createSelector, createFeatureSelector } from '@ngrx/store';
import { HoldingsState } from './holdings.reducer';

export const selectHoldingsState = createFeatureSelector<HoldingsState>('holdings');
export const selectAllHoldings = createSelector(selectHoldingsState, s => s.holdings);
export const selectHoldingsLoading = createSelector(selectHoldingsState, s => s.loading);
export const selectHoldingsSaving = createSelector(selectHoldingsState, s => s.saving);
export const selectHoldingsError = createSelector(selectHoldingsState, s => s.error);
export const selectSelectedType = createSelector(selectHoldingsState, s => s.selectedType);

export const selectFilteredHoldings = createSelector(
    selectAllHoldings,
    selectSelectedType,
    (holdings, type) => type ? holdings.filter(h => h.assetType === type) : holdings
);

export const selectHoldingsByType = createSelector(selectAllHoldings, holdings => {
    const grouped: Record<string, any[]> = {};
    holdings.forEach(h => {
        if (!grouped[h.assetType]) grouped[h.assetType] = [];
        grouped[h.assetType].push(h);
    });
    return grouped;
});

export const selectTotalByType = createSelector(selectAllHoldings, holdings => {
    const totals: Record<string, number> = {};
    holdings.forEach(h => {
        totals[h.assetType] = (totals[h.assetType] || 0) + (h.currentValue || 0);
    });
    return totals;
});
