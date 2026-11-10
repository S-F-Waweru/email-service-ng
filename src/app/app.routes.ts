import type { Routes } from '@angular/router';
import { authGuard, guestGuard, superAdminGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    // Theme lab: standalone page, kept outside the shell. Linked from the user menu for admins.
    path: 'theme',
    title: 'Theme lab',
    loadComponent: () => import('./theme/theme-preview').then((m) => m.ThemePreview),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'requests' },
      {
        path: 'requests',
        title: 'Requests',
        loadComponent: () => import('./features/requests/requests.page').then((m) => m.RequestsPage),
      },
      {
        path: 'companies',
        title: 'Companies',
        loadComponent: () => import('./features/companies/companies.page').then((m) => m.CompaniesPage),
      },
      {
        path: 'admin',
        canActivate: [superAdminGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'sites' },
          {
            path: 'sites',
            title: 'Sites',
            loadComponent: () => import('./features/admin/sites.page').then((m) => m.AdminSitesPage),
          },
          {
            path: 'users',
            title: 'Users',
            loadComponent: () => import('./features/admin/users.page').then((m) => m.AdminUsersPage),
          },
        ],
      },
      {
        path: '**',
        title: 'Not found',
        loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
