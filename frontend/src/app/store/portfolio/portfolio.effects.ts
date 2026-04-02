import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PortfolioService } from '../../core/services/portfolio.service';
import * as PortfolioActions from './portfolio.actions';

@Injectable()
export class PortfolioEffects {
    constructor(private actions$: Actions, private portfolioService: PortfolioService) { }

    loadPortfolio$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PortfolioActions.loadPortfolio),
            switchMap(() =>
                this.portfolioService.getSummary().pipe(
                    map(summary => PortfolioActions.loadPortfolioSuccess({ summary })),
                    catchError(error => of(PortfolioActions.loadPortfolioFailure({ error: error.message })))
                )
            )
        )
    );
}
