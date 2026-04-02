import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PortfolioService } from '../../core/services/portfolio.service';
import * as AgentActions from './agent.actions';

@Injectable()
export class AgentEffects {
    constructor(private actions$: Actions, private portfolioService: PortfolioService) { }

    analyzeStock$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentActions.analyzeStock),
            switchMap(({ ticker, securityId }) =>
                this.portfolioService.analyzeStock(ticker, securityId).pipe(
                    map(recommendation => AgentActions.analyzeStockSuccess({ recommendation })),
                    catchError(error => of(AgentActions.analyzeStockFailure({ error: error.message })))
                )
            )
        )
    );

    sendChat$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AgentActions.sendChat),
            switchMap(({ message }) =>
                this.portfolioService.chat(message).pipe(
                    map(res => AgentActions.chatResponse({ response: res.response })),
                    catchError(error => of(AgentActions.chatResponse({ response: `Error: ${error.message}` })))
                )
            )
        )
    );
}
