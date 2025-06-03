import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostListComponent } from './components/post-list/post-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    PostListComponent
  ],
  template: `
    <header class="bg-primary-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold">Angular Posts App</h1>
      </div>
    </header>
    
    <main>
      <app-post-list></app-post-list>
    </main>
    
    <footer class="bg-gray-100 mt-12 py-6">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>Built with Angular 19 and Tailwind CSS</p>
      </div>
    </footer>
  `
})
export class AppComponent {
  title = 'Angular Posts App';
}