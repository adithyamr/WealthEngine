import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PortfolioService } from '../../core/services/portfolio.service';

@Component({
  selector: 'we-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-wealth-dark flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="text-5xl mb-3">📊</div>
          <h1 class="text-3xl font-extrabold text-white">WealthEngine</h1>
          <p class="text-gray-400 mt-2">High-integrity financial analysis</p>
        </div>

        <!-- Card -->
        <div class="we-card">
          <h2 class="text-xl font-bold text-white mb-6">Sign In</h2>

          <div class="space-y-4">
            <div>
              <label class="text-sm text-gray-400 mb-1.5 block">Username</label>
              <input [(ngModel)]="username" type="text" placeholder="admin"
                     class="we-input" (keyup.enter)="login()"/>
            </div>
            <div>
              <label class="text-sm text-gray-400 mb-1.5 block">Password</label>
              <input [(ngModel)]="password" type="password" placeholder="••••••••"
                     class="we-input" (keyup.enter)="login()"/>
            </div>

            <div *ngIf="error" class="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-lg px-4 py-2">
              {{ error }}
            </div>

            <button (click)="login()" [disabled]="loading"
                    class="we-btn-primary w-full py-3 text-center justify-center flex items-center gap-2">
              <span *ngIf="loading" class="animate-spin">⟳</span>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </div>

          <p class="text-xs text-gray-600 mt-6 text-center">
            Default credentials: admin / changeme
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private portfolioService: PortfolioService, private router: Router) { }

  login() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.portfolioService.login(this.username, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('we_token', res.token);
        localStorage.setItem('we_username', this.username);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.status === 401 ? 'Invalid credentials' : 'Login failed. Is the backend running?';
        this.loading = false;
      }
    });
  }
}
