import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'we-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-5 py-4 space-y-4 min-h-full">
      <div>
        <h1 class="text-lg font-bold text-white">Settings</h1>
        <p class="text-gray-500 text-xs">Manage your account and preferences</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 flex-wrap">
        <button *ngFor="let t of tabs" (click)="tab=t"
          [class]="tab===t?'px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25':'px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-800 text-gray-500 hover:text-gray-300 border border-transparent transition-colors'">
          {{ t }}
        </button>
      </div>

      <!-- Profile -->
      <ng-container *ngIf="tab==='Profile'">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5">
            <div class="flex items-center gap-4 mb-5 pb-4 border-b border-gray-800/60">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">A</div>
              <div>
                <p class="text-sm font-bold text-white">Adithya</p>
                <p class="text-[10px] text-gray-500">adithya&#64;example.com</p>
                <button class="text-[10px] text-indigo-400 hover:text-indigo-300 mt-1">Change Avatar</button>
              </div>
            </div>
            <div class="space-y-3">
              <div *ngFor="let f of profileFields">
                <label class="text-[10px] text-gray-500 mb-1 block">{{ f.label }}</label>
                <input *ngIf="f.type!=='select'" [type]="f.type" [(ngModel)]="f.value" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                <select *ngIf="f.type==='select'" [(ngModel)]="f.value" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                  <option *ngFor="let o of f.options">{{ o }}</option>
                </select>
              </div>
              <button class="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">Save Changes</button>
            </div>
          </div>

          <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5">
            <h3 class="text-sm font-bold text-white mb-4">Preferences</h3>
            <div class="space-y-4">
              <div *ngFor="let p of preferences">
                <label class="text-[10px] text-gray-500 mb-1 block">{{ p.label }}</label>
                <select [(ngModel)]="p.value" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                  <option *ngFor="let o of p.options">{{ o }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Notifications -->
      <ng-container *ngIf="tab==='Notifications'">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-white mb-1">Notification Channels</h3>
            <div *ngFor="let n of notifChannels" class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-white">{{ n.label }}</p>
                <p class="text-[10px] text-gray-500">{{ n.desc }}</p>
              </div>
              <div class="relative cursor-pointer" (click)="n.on=!n.on">
                <div class="w-9 h-5 rounded-full transition-all duration-200" [class.bg-indigo-600]="n.on" [class.bg-gray-700]="!n.on"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" [class.translate-x-4]="n.on"></div>
              </div>
            </div>
          </div>
          <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-white mb-1">Notification Types</h3>
            <div *ngFor="let n of notifTypes" class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-white">{{ n.label }}</p>
                <p class="text-[10px] text-gray-500">{{ n.desc }}</p>
              </div>
              <div class="relative cursor-pointer" (click)="n.on=!n.on">
                <div class="w-9 h-5 rounded-full transition-all duration-200" [class.bg-indigo-600]="n.on" [class.bg-gray-700]="!n.on"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200" [class.translate-x-4]="n.on"></div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Security -->
      <ng-container *ngIf="tab==='Security'">
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 max-w-lg space-y-4">
          <h3 class="text-sm font-bold text-white mb-2">Change Password</h3>
          <div><label class="text-[10px] text-gray-400 mb-1 block">Current Password</label><input type="password" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="••••••••"></div>
          <div><label class="text-[10px] text-gray-400 mb-1 block">New Password</label><input type="password" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="••••••••"></div>
          <div><label class="text-[10px] text-gray-400 mb-1 block">Confirm Password</label><input type="password" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" placeholder="••••••••"></div>
          <button class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">Update Password</button>
          <div class="pt-3 border-t border-gray-800/60">
            <div class="flex items-center justify-between">
              <div><p class="text-xs font-semibold text-white">Two-Factor Authentication</p><p class="text-[10px] text-gray-500">Add an extra layer of security</p></div>
              <button class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold">Enable 2FA</button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Connected Accounts -->
      <ng-container *ngIf="tab==='Connected Accounts'">
        <div class="bg-[#0d1120] border border-gray-800/60 rounded-2xl p-5 space-y-4">
          <h3 class="text-sm font-bold text-white mb-1">Broker Accounts</h3>
          <div *ngFor="let a of brokers" class="flex items-center justify-between p-3 rounded-xl bg-gray-900/50">
            <div class="flex items-center gap-3"><span class="text-xl">{{ a.icon }}</span><div><p class="text-xs font-semibold text-white">{{ a.name }}</p><p class="text-[10px]" [class.text-wealth-green]="a.connected" [class.text-gray-500]="!a.connected">{{ a.connected?'Connected':'Not Connected' }}</p></div></div>
            <button class="text-[10px] font-semibold px-3 py-1.5 rounded-xl transition-all" [ngClass]="a.connected?'bg-red-900/40 text-red-400 hover:bg-red-900/60':'bg-indigo-600/40 text-indigo-400 hover:bg-indigo-600/60'">{{ a.connected?'Disconnect':'Connect' }}</button>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class SettingsComponent {
    tabs = ['Profile', 'Notifications', 'Security', 'Connected Accounts'];
    tab = 'Profile';

    profileFields = [
        { label: 'Full Name', type: 'text', value: 'Adithya', options: [] },
        { label: 'Email', type: 'email', value: 'adithya@example.com', options: [] },
        { label: 'Phone', type: 'tel', value: '+91 98765 43210', options: [] },
        { label: 'PAN Number', type: 'text', value: 'ABCDE1234F', options: [] },
    ];

    preferences = [
        { label: 'Currency', value: '₹ INR', options: ['₹ INR', '$ USD', '€ EUR', '£ GBP'] },
        { label: 'Theme', value: 'Dark', options: ['Dark', 'Light', 'System'] },
        { label: 'Default Landing Page', value: 'Dashboard', options: ['Dashboard', 'Holdings', 'Analysis'] },
        { label: 'Date Format', value: 'DD/MMM/YYYY', options: ['DD/MMM/YYYY', 'DD-MM-YYYY', 'MM/DD/YYYY'] },
    ];

    notifChannels = [
        { label: 'Email Notifications', desc: 'Alerts about your investments', on: true },
        { label: 'Transaction Alerts', desc: 'Notify on every trade', on: true },
        { label: 'Market Updates', desc: 'Daily market summary', on: false },
        { label: 'AI Insights', desc: 'Personalized AI recommendations', on: true },
    ];

    notifTypes = [
        { label: 'Price Alerts', desc: 'When watchlist stocks hit targets', on: true },
        { label: 'Goal Milestones', desc: 'When goals reach key milestones', on: true },
        { label: 'SIP Reminders', desc: 'Upcoming SIP due dates', on: true },
        { label: 'Tax Reminders', desc: 'Important tax deadlines', on: true },
    ];

    brokers = [
        { icon: '🏦', name: 'Zerodha Kite', connected: true },
        { icon: '📈', name: 'Groww', connected: false },
        { icon: '💼', name: 'Angel One', connected: false },
        { icon: '🏛️', name: 'HDFC Securities', connected: false },
    ];
}
