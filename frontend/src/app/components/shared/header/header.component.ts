import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'we-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="border-b border-gray-800 bg-wealth-card/50 backdrop-blur-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📊</span>
          <span class="font-bold text-xl text-white tracking-tight">WealthEngine</span>
          <span class="text-xs text-gray-700 border border-gray-700 px-2 py-0.5 rounded-full">BETA</span>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center gap-0.5">
          <a routerLink="/dashboard" routerLinkActive="!text-white bg-gray-800"
             [routerLinkActiveOptions]="{exact: true}"
             class="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <span>🏠</span> Dashboard
          </a>
          <a routerLink="/holdings" routerLinkActive="!text-white bg-gray-800"
             class="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <span>💼</span> Holdings
          </a>
          <a routerLink="/analysis" routerLinkActive="!text-white bg-gray-800"
             class="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <span>🤖</span> AI Analysis
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-wealth-accent flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <button (click)="logout()"
                  class="text-xs text-gray-500 hover:text-red-400 transition-colors ml-1">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  logout() {
    localStorage.removeItem('we_token');
    window.location.href = '/login';
  }
}
