import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
    { path: 'holdings', loadComponent: () => import('./pages/holdings/holdings.component').then(m => m.HoldingsComponent), canActivate: [authGuard] },
    { path: 'analysis', loadComponent: () => import('./pages/analysis/analysis.component').then(m => m.AnalysisComponent), canActivate: [authGuard] },
    { path: 'goals', loadComponent: () => import('./pages/goals/goals.component').then(m => m.GoalsComponent), canActivate: [authGuard] },
    { path: 'watchlist', loadComponent: () => import('./pages/watchlist/watchlist.component').then(m => m.WatchlistComponent), canActivate: [authGuard] },
    { path: 'ai-picks', loadComponent: () => import('./pages/ai-picks/ai-picks.component').then(m => m.AiPicksComponent), canActivate: [authGuard] },
    { path: 'transactions', loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent), canActivate: [authGuard] },
    { path: 'reports', loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent), canActivate: [authGuard] },
    { path: 'tax-center', loadComponent: () => import('./pages/tax-center/tax-center.component').then(m => m.TaxCenterComponent), canActivate: [authGuard] },
    { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: '/dashboard' }
];
