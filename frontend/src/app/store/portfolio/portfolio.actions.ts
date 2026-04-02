import { createAction, props } from '@ngrx/store';
import { PortfolioSummary } from '../../core/services/portfolio.service';

export const loadPortfolio = createAction('[Portfolio] Load');
export const loadPortfolioSuccess = createAction('[Portfolio] Load Success', props<{ summary: PortfolioSummary }>());
export const loadPortfolioFailure = createAction('[Portfolio] Load Failure', props<{ error: string }>());
