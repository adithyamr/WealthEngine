import { Component } from '@angular/core';
import { LiveConsoleComponent } from '../../components/live-console/live-console.component';

@Component({
    selector: 'we-analysis',
    standalone: true,
    imports: [LiveConsoleComponent],
    template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">AI Analysis</h1>
        <p class="text-gray-400 text-sm">Deep-dive agent analysis and natural language portfolio queries</p>
      </div>
      <we-live-console></we-live-console>
    </div>
  `
})
export class AnalysisComponent { }
