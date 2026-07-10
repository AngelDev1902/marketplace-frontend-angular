import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // ─── Rutas públicas (auth) ──────────────────────────────────────────────────
  {
    path: 'auth/login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/complete-profile',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./features/auth/complete-profile/complete-profile').then(
        (m) => m.CompleteProfileComponent
      ),
  },

  // ─── Rutas protegidas (dashboard) ──────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/product-create/product-create.component').then(
            (m) => m.ProductCreateComponent
          ),
      },
    ],
  },

  // ─── Fallback ────────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
