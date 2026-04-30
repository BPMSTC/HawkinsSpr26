import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home').then(m => m.HomeComponent),
  },
  {
    path: 'interactive',
    loadComponent: () =>
      import('./interactive/interactive').then(m => m.InteractiveComponent),
  },
  {
    path: 'interactive/:storyPath',
    loadComponent: () =>
      import('./interactive/interactive').then(m => m.InteractiveComponent),
  },
  { path: '**', redirectTo: '' },
];