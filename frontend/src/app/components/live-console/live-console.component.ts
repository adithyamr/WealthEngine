import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { analyzeStock, sendChat } from '../../store/agent/agent.actions';
import { RecommendationDto } from '../../core/services/portfolio.service';

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

@Component({
    selector: 'we-live-console',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-wealth-card rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
      <div class="border-b border-gray-800 p-4 flex items-center gap-3">
        <div class="flex gap-1.5">
          <span class="w-3 h-3 rounded-full bg-red-500"></span>
          <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
          <span class="w-3 h-3 rounded-full bg-wealth-green"></span>
        </div>
        <span class="text-sm font-mono text-gray-400">WealthEngine AI Console</span>
        <div class="ml-auto flex gap-2">
          <button (click)="mode='analyze'"
                  [class]="mode === 'analyze' ? 'px-3 py-1 text-xs rounded-full bg-wealth-accent text-white' : 'px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-400 hover:text-white'">
            Deep Analyze
          </button>
          <button (click)="mode='chat'"
                  [class]="mode === 'chat' ? 'px-3 py-1 text-xs rounded-full bg-wealth-accent text-white' : 'px-3 py-1 text-xs rounded-full bg-gray-800 text-gray-400 hover:text-white'">
            Chat / NLI
          </button>
        </div>
      </div>

      <!-- Analyze Mode -->
      <div *ngIf="mode === 'analyze'" class="p-6">
        <div class="flex gap-3 mb-6">
          <input
            [(ngModel)]="ticker"
            (keyup.enter)="startAnalysis()"
            placeholder="Enter NSE ticker (e.g. INFY, RELIANCE)"
            class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-wealth-accent focus:outline-none font-mono uppercase"
          />
          <button
            (click)="startAnalysis()"
            [disabled]="analyzing"
            class="px-6 py-3 bg-wealth-accent hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25">
            {{ analyzing ? 'Analyzing...' : '🔍 Analyze' }}
          </button>
        </div>

        <div *ngIf="analyzing" class="flex items-center gap-3 text-gray-400 animate-pulse">
          <div class="flex gap-1">
            <span class="w-2 h-2 rounded-full bg-wealth-accent animate-bounce" style="animation-delay:0ms"></span>
            <span class="w-2 h-2 rounded-full bg-wealth-accent animate-bounce" style="animation-delay:150ms"></span>
            <span class="w-2 h-2 rounded-full bg-wealth-accent animate-bounce" style="animation-delay:300ms"></span>
          </div>
          <span class="text-sm">Agent is analyzing: fetching market data → sentiment → portfolio fit...</span>
        </div>

        <div *ngIf="recommendation && !analyzing" class="animate-slide-up">
          <div class="flex items-center gap-4 mb-4">
            <span class="text-2xl font-bold font-mono">{{ recommendation.ticker }}</span>
            <span [class]="getActionClass(recommendation.action)" class="px-4 py-1.5 rounded-full text-sm font-bold">
              {{ recommendation.action }}
            </span>
            <span class="text-sm text-gray-400">Confidence: {{ (recommendation.confidenceScore * 100).toFixed(0) }}%</span>
            <span class="ml-auto text-xs px-2 py-1 rounded-full"
                  [class]="recommendation.riskLevel === 'HIGH' ? 'bg-red-900 text-red-300' : recommendation.riskLevel === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'">
              {{ recommendation.riskLevel }} RISK
            </span>
          </div>
          <div class="bg-gray-900 rounded-xl p-4 text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
            {{ recommendation.reasoning }}
          </div>
        </div>
      </div>

      <!-- Chat / NLI Mode -->
      <div *ngIf="mode === 'chat'" class="flex flex-col" style="height: 380px;">
        <div class="flex-1 overflow-y-auto p-4 space-y-3" #chatContainer>
          <div *ngIf="chatMessages.length === 0" class="flex items-center justify-center h-full text-gray-500 text-sm">
            Ask anything about your portfolio in plain English.<br>
            e.g. "What is my total NPS balance?" or "Which sector am I over-invested in?"
          </div>
          <div *ngFor="let msg of chatMessages"
               [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div [class]="msg.role === 'user'
              ? 'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl rounded-br-sm bg-wealth-accent text-white text-sm'
              : 'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl rounded-bl-sm bg-gray-800 text-gray-200 text-sm font-mono'">
              {{ msg.content }}
            </div>
          </div>
        </div>
        <div class="border-t border-gray-800 p-4 flex gap-3">
          <input
            [(ngModel)]="chatInput"
            (keyup.enter)="sendMessage()"
            placeholder="Ask about your portfolio..."
            class="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-wealth-accent focus:outline-none"
          />
          <button (click)="sendMessage()"
                  class="px-4 py-2.5 bg-wealth-accent hover:bg-indigo-500 text-white rounded-xl transition-colors">
            ➤
          </button>
        </div>
      </div>
    </div>
  `
})
export class LiveConsoleComponent implements OnInit {
    mode: 'analyze' | 'chat' = 'analyze';
    ticker = '';
    chatInput = '';
    analyzing = false;
    recommendation: RecommendationDto | null = null;
    chatMessages: ChatMessage[] = [];

    constructor(private store: Store<any>) { }

    ngOnInit() {
        this.store.select((s: any) => s.agent).subscribe((agentState: any) => {
            this.analyzing = agentState.analyzing;
            this.recommendation = agentState.recommendation;
            this.chatMessages = agentState.chatMessages;
        });
    }

    startAnalysis() {
        if (!this.ticker.trim()) return;
        this.store.dispatch(analyzeStock({ ticker: this.ticker.toUpperCase(), securityId: '' }));
    }

    sendMessage() {
        if (!this.chatInput.trim()) return;
        this.store.dispatch(sendChat({ message: this.chatInput }));
        this.chatInput = '';
    }

    getActionClass(action: string): string {
        const classes: Record<string, string> = {
            STRONG_BUY: 'bg-green-900 text-green-300 border border-green-700',
            BUY: 'bg-green-800 text-green-200',
            HOLD: 'bg-yellow-900 text-yellow-300',
            SELL: 'bg-red-800 text-red-200',
            STRONG_SELL: 'bg-red-900 text-red-300 border border-red-700',
        };
        return classes[action] || 'bg-gray-800 text-gray-300';
    }
}
