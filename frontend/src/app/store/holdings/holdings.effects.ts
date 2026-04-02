import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PortfolioService } from '../../core/services/portfolio.service';
import * as HoldingsActions from './holdings.actions';

@Injectable()
export class HoldingsEffects {
    constructor(private actions$: Actions, private portfolioService: PortfolioService) { }

    loadHoldings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(HoldingsActions.loadHoldings),
            switchMap(() =>
                this.portfolioService.getAllHoldings().pipe(
                    map(holdings => HoldingsActions.loadHoldingsSuccess({ holdings })),
                    catchError(err => of(HoldingsActions.loadHoldingsFailure({ error: err.message })))
                )
            )
        )
    );

    addHolding$ = createEffect(() =>
        this.actions$.pipe(
            ofType(HoldingsActions.addHolding),
            switchMap(({ request }) =>
                this.portfolioService.createHolding(request).pipe(
                    map(holding => HoldingsActions.addHoldingSuccess({ holding })),
                    catchError(err => of(HoldingsActions.addHoldingFailure({ error: err.error?.message || err.message })))
                )
            )
        )
    );

    updateHolding$ = createEffect(() =>
        this.actions$.pipe(
            ofType(HoldingsActions.updateHolding),
            switchMap(({ id, request }) =>
                this.portfolioService.updateHolding(id, request).pipe(
                    map(holding => HoldingsActions.updateHoldingSuccess({ holding })),
                    catchError(err => of(HoldingsActions.addHoldingFailure({ error: err.message })))
                )
            )
        )
    );

    deleteHolding$ = createEffect(() =>
        this.actions$.pipe(
            ofType(HoldingsActions.deleteHolding),
            switchMap(({ id }) =>
                this.portfolioService.deleteHolding(id).pipe(
                    map(() => HoldingsActions.deleteHoldingSuccess({ id })),
                    catchError(err => of(HoldingsActions.addHoldingFailure({ error: err.message })))
                )
            )
        )
    );
}
