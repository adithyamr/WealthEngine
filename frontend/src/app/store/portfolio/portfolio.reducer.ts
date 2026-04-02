import { createReducer, on } from '@ngrx/store';
import { PortfolioSummary } from '../../core/services/portfolio.service';
import * as PortfolioActions from './portfolio.actions';

export interface PortfolioState {
    summary: PortfolioSummary | null;
    loading: boolean;
    error: string | null;
}

const initialState: PortfolioState = {
    summary: null,
    loading: false,
    error: null,
};

export const portfolioReducer = createReducer(
    initialState,
    on(PortfolioActions.loadPortfolio, state => ({ ...state, loading: true, error: null })),
    on(PortfolioActions.loadPortfolioSuccess, (state, { summary }) => ({ ...state, summary, loading: false })),
    on(PortfolioActions.loadPortfolioFailure, (state, { error }) => ({ ...state, error, loading: false }))
);
