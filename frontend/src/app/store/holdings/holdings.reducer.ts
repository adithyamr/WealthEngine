import { createReducer, on } from '@ngrx/store';
import { AssetDto } from '../../core/services/portfolio.service';
import * as HoldingsActions from './holdings.actions';

export interface HoldingsState {
    holdings: AssetDto[];
    selectedType: string | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: HoldingsState = {
    holdings: [],
    selectedType: null,
    loading: false,
    saving: false,
    error: null,
};

export const holdingsReducer = createReducer(
    initialState,
    on(HoldingsActions.loadHoldings, s => ({ ...s, loading: true, error: null })),
    on(HoldingsActions.loadHoldingsSuccess, (s, { holdings }) => ({ ...s, holdings, loading: false })),
    on(HoldingsActions.loadHoldingsFailure, (s, { error }) => ({ ...s, error, loading: false })),

    on(HoldingsActions.addHolding, s => ({ ...s, saving: true, error: null })),
    on(HoldingsActions.addHoldingSuccess, (s, { holding }) => ({
        ...s, holdings: [...s.holdings, holding], saving: false
    })),
    on(HoldingsActions.addHoldingFailure, (s, { error }) => ({ ...s, error, saving: false })),

    on(HoldingsActions.updateHoldingSuccess, (s, { holding }) => ({
        ...s,
        holdings: s.holdings.map(h => h.id === holding.id ? holding : h)
    })),

    on(HoldingsActions.deleteHoldingSuccess, (s, { id }) => ({
        ...s, holdings: s.holdings.filter(h => h.id !== id)
    })),

    on(HoldingsActions.setSelectedType, (s, { assetType }) => ({ ...s, selectedType: assetType }))
);
