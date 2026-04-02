import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';

@Component({
    selector: 'we-root',
    imports: [RouterOutlet, HeaderComponent],
    template: `
    <div class="min-h-screen bg-wealth-dark text-gray-100 font-sans">
      <we-header></we-header>
      <main class="container mx-auto px-4 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent { }
