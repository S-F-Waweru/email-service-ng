import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'theme',
    title: 'Theme preview',
    loadComponent: () => import('./theme/theme-preview').then((m) => m.ThemePreview),
  },
  // Until the dashboard pages exist, land on the theme preview.
  { path: '', pathMatch: 'full', redirectTo: 'theme' },
];
