import { createAction, props } from '@ngrx/store';
import { AssetDto } from '../../core/services/portfolio.service';

export const loadHoldings = createAction('[Holdings] Load All');
export const loadHoldingsSuccess = createAction('[Holdings] Load All Success', props<{ holdings: AssetDto[] }>());
export const loadHoldingsFailure = createAction('[Holdings] Load Failure', props<{ error: string }>());

export const addHolding = createAction('[Holdings] Add', props<{ request: any }>());
export const addHoldingSuccess = createAction('[Holdings] Add Success', props<{ holding: AssetDto }>());
export const addHoldingFailure = createAction('[Holdings] Add Failure', props<{ error: string }>());

export const updateHolding = createAction('[Holdings] Update', props<{ id: number; request: any }>());
export const updateHoldingSuccess = createAction('[Holdings] Update Success', props<{ holding: AssetDto }>());

export const deleteHolding = createAction('[Holdings] Delete', props<{ id: number }>());
export const deleteHoldingSuccess = createAction('[Holdings] Delete Success', props<{ id: number }>());

export const setSelectedType = createAction('[Holdings] Set Selected Type', props<{ assetType: string | null }>());
