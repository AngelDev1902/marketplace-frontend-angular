import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { FirebaseAuthService } from '../../../core/services/firebase-auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LogoPrimary } from '../../../shared/components/logo-primary/logo-primary';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';

/**
 *   - Panel izquierdo: Branding / beneficios (oculto en móvil)
 *   - Panel derecho: Formulario con tabs Login / Registro
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LogoPrimary,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
  ],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  private readonly firebaseAuthService = inject(FirebaseAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly themeService = inject(ThemeService);

  // Al iniciar el componente, se fuerza el tema claro. Al destruirse, se restaura el tema anterior.
  ngOnInit(): void {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  ngOnDestroy(): void {
    const root = document.documentElement;
    if (this.themeService.isDark()) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }

  readonly stateOptions = [
    { label: 'Iniciar Sesión', value: true },
    { label: 'Registro Nuevo', value: false },
  ];

  // Estado reactivo con signals
  readonly isLogin = signal(true);
  readonly showPassword = signal(false);

  // Beneficios del panel izquierdo
  readonly benefits = [
    'Acceso a más de 10,000 boutiques registradas.',
    'Gestión de envíos automatizada con guías prepagadas.',
    'Pagos seguros y garantizados a tu cuenta bancaria.',
    'Herramientas de análisis de tendencias con IA.',
  ];

  // Formulario reactivo
  readonly form = this.fb.group({
    firstName: [''],
    lastName: [''],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    terms: [false],
  });

  setTab(login: boolean): void {
    this.isLogin.set(login);
    this.authService.clearError();
    this.form.reset();
    this.showPassword.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.authService.setLoading(true);
    this.authService.clearError();
    const { email, password, firstName, lastName, phoneNumber } = this.form.value;

    const request$ = this.isLogin()
      ? this.firebaseAuthService.loginWithEmail(email!, password!)
      : this.firebaseAuthService.registerWithEmail(
          { firstName: firstName!, lastName: lastName!, phoneNumber: phoneNumber!, email: email! },
          password!
        );

    request$.pipe(finalize(() => this.authService.setLoading(false))).subscribe({
      next: (response) => {
        this.authService.setSession(response);
      },
      error: (err) => {
        this.authService.setError(err.message || 'Credenciales inválidas o error en el servidor');
      },
    });
  }

  onGoogleSubmit(): void {
    this.authService.setLoading(true);
    this.authService.clearError();

    const request$ = this.isLogin()
      ? this.firebaseAuthService.loginWithGoogle()
      : this.firebaseAuthService.registerWithGoogle();

    request$.pipe(finalize(() => this.authService.setLoading(false))).subscribe({
      next: (response) => {
        this.authService.setSession(response);
      },
      error: (err) => {
        this.authService.setError(err.message || 'Error al iniciar sesión con Google');
      },
    });
  }
}
