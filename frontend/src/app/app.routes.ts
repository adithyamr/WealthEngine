import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'holdings',
        loadComponent: () => import('./pages/holdings/holdings.component').then(m => m.HoldingsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'analysis',
        loadComponent: () => import('./pages/analysis/analysis.component').then(m => m.AnalysisComponent),
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '/dashboard' }
];
