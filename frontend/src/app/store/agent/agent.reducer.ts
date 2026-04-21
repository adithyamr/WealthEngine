import { createReducer, on } from '@ngrx/store';
import { RecommendationDto } from '../../core/services/portfolio.service';
import * as AgentActions from './agent.actions';

export interface AgentState {
    recommendation: RecommendationDto | null;
    chatMessages: { role: 'user' | 'assistant'; content: string }[];
    analyzing: boolean;
    error: string | null;
}

const initialState: AgentState = {
    recommendation: null,
    chatMessages: [],
    analyzing: false,
    error: null,
};

export const agentReducer = createReducer(
    initialState,
    on(AgentActions.analyzeStock, state => ({ ...state, analyzing: true, error: null })),
    on(AgentActions.analyzeStockSuccess, (state, { recommendation }) => ({ ...state, recommendation, analyzing: false })),
    on(AgentActions.analyzeStockFailure, (state, { error }) => ({ ...state, error, analyzing: false })),
    on(AgentActions.sendChat, (state, { message }) => ({
        ...state,
        chatMessages: [...state.chatMessages, { role: 'user' as const, content: message }]
    })),
    on(AgentActions.chatResponse, (state, { response }) => ({
        ...state,
        chatMessages: [...state.chatMessages, { role: 'assistant' as const, content: response }]
    }))
);
