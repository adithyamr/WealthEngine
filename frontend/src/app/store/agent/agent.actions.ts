import { createAction, props } from '@ngrx/store';
import { RecommendationDto } from '../../core/services/portfolio.service';

export const analyzeStock = createAction('[Agent] Analyze Stock', props<{ ticker: string; securityId: string }>());
export const analyzeStockSuccess = createAction('[Agent] Analyze Success', props<{ recommendation: RecommendationDto }>());
export const analyzeStockFailure = createAction('[Agent] Analyze Failure', props<{ error: string }>());
export const sendChat = createAction('[Agent] Send Chat', props<{ message: string }>());
export const chatResponse = createAction('[Agent] Chat Response', props<{ response: string }>());
