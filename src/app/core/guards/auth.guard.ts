import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Verifica:
 * 1. Si no está autenticado → redirige a /auth/login
 * 2. Si está autenticado pero en estado PENDIENTE → redirige a /auth/complete-profile
 * 3. Si está ACTIVO → permite el acceso
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.isPending()) {
    return router.createUrlTree(['/auth/complete-profile']);
  }

  return true;
};

/**
 * Si ya está autenticado, lo redirige a donde le corresponde:
 *   - PENDIENTE → /auth/complete-profile
 *   - ACTIVO    → /dashboard
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true; // No autenticado → puede ver rutas públicas
  }

  if (authService.isPending()) {
    return router.createUrlTree(['/auth/complete-profile']);
  }

  return router.createUrlTree(['/dashboard']);
};
