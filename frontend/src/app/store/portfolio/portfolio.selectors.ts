import { createSelector, createFeatureSelector } from '@ngrx/store';
import { PortfolioState } from './portfolio.reducer';

export const selectPortfolioState = createFeatureSelector<PortfolioState>('portfolio');
export const selectSummary = createSelector(selectPortfolioState, s => s.summary);
export const selectLoading = createSelector(selectPortfolioState, s => s.loading);
export const selectError = createSelector(selectPortfolioState, s => s.error);
