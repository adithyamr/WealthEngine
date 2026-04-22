import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'we-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- Login page: full screen, no sidebar -->
    <ng-container *ngIf="isLoginPage">
      <router-outlet></router-outlet>
    </ng-container>

    <!-- App shell: sidebar + content -->
    <div *ngIf="!isLoginPage" class="flex h-screen bg-wealth-dark text-gray-100 font-sans overflow-hidden">

      <!-- ── Sidebar ── -->
      <aside class="w-52 flex-shrink-0 flex flex-col bg-[#0d1120] border-r border-gray-800/60">

        <!-- Logo -->
        <div class="px-4 py-4 flex items-center gap-2 border-b border-gray-800/60">
          <div class="w-7 h-7 rounded-lg bg-wealth-accent flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 12 L5 8 L8 10 L11 5 L14 7" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="font-bold text-sm text-white tracking-tight">WealthEngine</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          <ng-container *ngFor="let item of allNav">
            <div *ngIf="item.divider" class="pt-2.5 pb-1 px-2 text-[9px] font-bold text-gray-600 uppercase tracking-wider">{{ item.divider }}</div>
            <a *ngIf="!item.divider && item.route" [routerLink]="item.route"
               routerLinkActive="bg-indigo-500/15 text-indigo-300 border-indigo-500/25"
               [routerLinkActiveOptions]="{exact: item.exact||false}"
               class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all border border-transparent">
              <span class="w-3.5 h-3.5 flex-shrink-0 flex items-center" [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          </ng-container>
        </nav>

        <!-- Market Overview -->
        <div class="mx-2 mb-2 p-2.5 bg-gray-900/50 rounded-xl border border-gray-800/50">
          <p class="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Market Overview</p>
          <div class="space-y-1.5">
            <div *ngFor="let m of markets" class="flex justify-between items-center">
              <div>
                <p class="text-[9px] font-semibold text-gray-300">{{ m.name }}</p>
                <p class="text-[10px] font-bold text-white">{{ m.value }}</p>
              </div>
              <span class="text-[9px] font-bold" [class.text-wealth-green]="m.up" [class.text-wealth-red]="!m.up">{{ m.change }}</span>
            </div>
            <p class="text-[8px] text-gray-700">Updated: 10:30 AM</p>
          </div>
        </div>

      </aside>

      <!-- Main -->
      <div class="flex-1 overflow-hidden">
        <main class="h-full overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  isLoginPage = false;
  username = 'User';
  userInitial = 'U';

  constructor(private router: Router) { }

  ngOnInit() {
    // Detect route changes to show/hide sidebar
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isLoginPage = e.urlAfterRedirects === '/login';
      this.loadUser();
    });

    // Set initial state
    this.isLoginPage = this.router.url === '/login';
    this.loadUser();
  }

  loadUser() {
    const stored = localStorage.getItem('we_username');
    if (stored) {
      this.username = stored;
      this.userInitial = stored.charAt(0).toUpperCase();
    }
  }

  allNav = [
    { label: 'Dashboard', route: '/dashboard', exact: true, icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z"/></svg>` },
    { label: 'Portfolio', route: '/holdings', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>` },
    { label: 'Goals', route: '/goals', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>` },
    { label: 'Watchlist', route: '/watchlist', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>` },
    { label: 'Analysis', route: '/analysis', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>` },
    { divider: 'Tools' },
    { label: 'Transactions', route: '/transactions', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>` },
    { label: 'Reports', route: '/reports', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>` },
    { label: 'Tax Center', route: '/tax-center', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>` },
    { label: 'Settings', route: '/settings', icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>` },
  ];

  markets = [
    { name: 'NIFTY 50', value: '22,945.30', change: '+0.85%', up: true },
    { name: 'SENSEX', value: '75,231.18', change: '+0.78%', up: true },
    { name: 'BANK NIFTY', value: '48,814.25', change: '+0.61%', up: true },
    { name: 'US 10Y Yield', value: '4.28%', change: '-0.03%', up: false },
  ];

  logout() { localStorage.removeItem('we_token'); localStorage.removeItem('we_username'); window.location.href = '/login'; }
}
