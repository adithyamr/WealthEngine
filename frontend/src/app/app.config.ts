import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { portfolioReducer } from './store/portfolio/portfolio.reducer';
import { agentReducer } from './store/agent/agent.reducer';
import { holdingsReducer } from './store/holdings/holdings.reducer';
import { PortfolioEffects } from './store/portfolio/portfolio.effects';
import { AgentEffects } from './store/agent/agent.effects';
import { HoldingsEffects } from './store/holdings/holdings.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideStore({
            portfolio: portfolioReducer,
            agent: agentReducer,
            holdings: holdingsReducer,
        }),
        provideEffects([PortfolioEffects, AgentEffects, HoldingsEffects]),
        provideStoreDevtools({ maxAge: 25, logOnly: false }),
    ],
};
