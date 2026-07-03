import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { IdentityService } from './identity.service';
import { VendorProfileService } from './vendor-profile.service';
import { AuthLoginResponseDto } from '../../shared/models/responses/auth.response.model';
import {
  UserRegistrationDto,
  VendorRegistrationDto,
} from '../../shared/models/requests/auth.request.model';
import { firstValueFrom } from 'rxjs';

const SESSION_KEY = 'marketplace_vendor_session';

const firebaseApp = initializeApp(environment.firebase);
const firebaseAuth = getAuth(firebaseApp);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly identityService = inject(IdentityService);
  private readonly vendorProfileService = inject(VendorProfileService);

  readonly user = signal<AuthLoginResponseDto | null>(this._loadSession());
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly isPending = computed(() => this.user()?.status === 'PENDIENTE');
  readonly isActive = computed(() => this.user()?.status === 'ACTIVO');

  // ──────────────────────────────────────────────────────────────────────────────
  // Métodos públicos
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Login con Google
   */
  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseToken = await result.user.getIdToken();
      const backendResponse = await firstValueFrom(this.identityService.login({ firebaseToken }));
      this._handleSessionSuccess(backendResponse);
    } catch (err: any) {
      console.error('Error en login con Google:', err);
      this.error.set(err.message ?? 'Error al iniciar sesión con Google');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Registro con Google
   */
  async registerWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseToken = await result.user.getIdToken();

      const payload: UserRegistrationDto = {
        email: result.user.email ?? '',
        firebaseToken,
        firstName: result.user.displayName ?? '',
        lastName: result.user.displayName ?? '',
        phoneNumber: result.user.phoneNumber ?? '',
      };

      const backendResponse = await firstValueFrom(this.identityService.registerVendor(payload));
      this._handleSessionSuccess(backendResponse);
    } catch (err: any) {
      console.error('Error en registro con Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        this.error.set('El inicio de sesión fue cancelado.');
      } else {
        this.error.set(err.message ?? 'Error al registrar vendedor con Google');
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Login con Email/Password
   */
  async loginWithEmail(email: string, password: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const firebaseToken = await result.user.getIdToken();
      const backendResponse = await firstValueFrom(this.identityService.login({ firebaseToken }));
      this._handleSessionSuccess(backendResponse);
    } catch (err: any) {
      console.error('Error en login por email:', err);
      this.error.set('Credenciales inválidas o error en el servidor');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Registro con Email/Password
   */
  async registerWithEmail(
    vendorData: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
    },
    password: string
  ): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, vendorData.email, password);
      const firebaseToken = await result.user.getIdToken();

      const payload: UserRegistrationDto = {
        email: result.user.email ?? vendorData.email,
        firebaseToken,
        firstName: vendorData.firstName,
        lastName: vendorData.lastName,
        phoneNumber: vendorData.phoneNumber,
      };

      const backendResponse = await firstValueFrom(this.identityService.registerVendor(payload));
      this._handleSessionSuccess(backendResponse);
    } catch (err: any) {
      console.error('Error en registro por email:', err);
      if (err.code === 'auth/email-already-in-use') {
        this.error.set('El correo ya está en uso');
      } else if (err.code === 'auth/weak-password') {
        this.error.set('La contraseña debe tener al menos 6 caracteres');
      } else {
        this.error.set(err.message ?? 'Error al registrar vendedor');
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Completa el perfil del vendedor (onboarding paso 2)
   */
  async completeVendorProfile(vendorData: VendorRegistrationDto): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(this.vendorProfileService.completeProfile(vendorData));

      // Re-autenticar con Firebase para obtener el nuevo JWT con status ACTIVO
      const firebaseUser = firebaseAuth.currentUser;

      if (firebaseUser) {
        const firebaseToken = await firebaseUser.getIdToken(true); // force refresh
        const backendResponse = await firstValueFrom(this.identityService.login({ firebaseToken }));
        this._handleSessionSuccess(backendResponse);
      } else {
        // Fallback: actualizar status localmente si Firebase no responde
        const current = this.user();
        if (current) {
          const updated = { ...current, status: response.status };
          localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
          this.user.set(updated);
        }
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    } catch (err: any) {
      console.error('Error al completar perfil:', err);
      this.error.set(err.message ?? 'Error al completar el registro del negocio');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Cierra sesión en Firebase y limpia el estado local
   */
  async logout(): Promise<void> {
    await firebaseAuth.signOut();
    localStorage.removeItem(SESSION_KEY);
    this.user.set(null);
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  /**
   * Limpia el error actual
   */
  clearError(): void {
    this.error.set(null);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Helpers privados
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Guarda sesión en localStorage, actualiza el signal y redirige.
   * Regla de negocio: PENDIENTE → complete-profile, ACTIVO → dashboard
   */
  private _handleSessionSuccess(sessionData: AuthLoginResponseDto): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    this.user.set(sessionData);

    if (sessionData.status === 'PENDIENTE') {
      this.router.navigate(['/auth/complete-profile'], { replaceUrl: true });
    } else {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  /**
   * Carga la sesión persisted en localStorage al inicializar el servicio
   */
  private _loadSession(): AuthLoginResponseDto | null {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}
