import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * onboardingGuard — protege la ruta /auth/complete-profile
 *
 * Reglas:
 * 1. Si no está autenticado → redirige a /auth/login
 * 2. Si está ACTIVO (ya completó el perfil) → redirige a /dashboard
 * 3. Si está PENDIENTE → permite el acceso a complete-profile
 */
export const onboardingGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  // Si ya completó el onboarding, no debería estar en complete-profile
  if (authService.isActive()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true; // PENDIENTE → puede acceder a complete-profile
};
