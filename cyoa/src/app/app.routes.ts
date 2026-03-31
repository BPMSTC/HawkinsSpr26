import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  {
    path: 'interactive/:storyPath',
    loadComponent: () =>
      import('./interactive/interactive').then(m => m.InteractiveComponent),
  },
  { path: '**', redirectTo: '' },
];
