import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthLoginResponseDto } from '../../shared/models/responses/auth.response.model';
import { FirebaseAuthService } from './firebase-auth.service';

const SESSION_KEY = 'marketplace_vendor_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly firebaseAuthService = inject(FirebaseAuthService);

  readonly user = signal<AuthLoginResponseDto | null>(this._loadSession());
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly isPending = computed(() => this.user()?.status === 'PENDIENTE');
  readonly isActive = computed(() => this.user()?.status === 'ACTIVO');

  /**
   * Guarda la sesión, actualiza el estado local y redirige según el estatus
   */
  setSession(sessionData: AuthLoginResponseDto): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    this.user.set(sessionData);

    if (sessionData.status === 'PENDIENTE') {
      this.router.navigate(['/auth/complete-profile'], { replaceUrl: true });
    } else {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  /**
   * Limpia la sesión y el estado local
   */
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    this.user.set(null);
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  /**
   * Gestiona el estado de carga
   */
  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  /**
   * Gestiona el estado de error
   */
  setError(error: string | null): void {
    this.error.set(error);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Cierra sesión en Firebase y localmente
   */
  logout(): void {
    this.setLoading(true);
    this.firebaseAuthService.logout().subscribe({
      next: () => {
        this.clearSession();
        this.setLoading(false);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        // Limpiamos la sesión local de todas formas
        this.clearSession();
        this.setLoading(false);
      },
    });
  }

  private _loadSession(): AuthLoginResponseDto | null {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}
