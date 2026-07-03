import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Contiene login Y registro en un mismo componente con tab switcher,
 * replicando exactamente el diseño de dos paneles del original:
 *   - Panel izquierdo: Branding / beneficios (oculto en móvil)
 *   - Panel derecho: Formulario con tabs Login / Registro
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styles: [
    `
      .input-field {
        width: 100%;
        padding: 0.625rem 0.875rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 0.875rem;
        color: #0f172a;
        background: #fff;
        transition: border-color 0.15s, box-shadow 0.15s;
        outline: none;
      }
      .input-field:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      }
      .input-field::placeholder {
        color: #94a3b8;
      }
    `,
  ],
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

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

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const { email, password, firstName, lastName, phoneNumber } = this.form.value;

    if (this.isLogin()) {
      await this.authService.loginWithEmail(email!, password!);
    } else {
      await this.authService.registerWithEmail(
        { firstName: firstName!, lastName: lastName!, phoneNumber: phoneNumber!, email: email! },
        password!
      );
    }
  }

  async onGoogleSubmit(): Promise<void> {
    if (this.isLogin()) {
      await this.authService.loginWithGoogle();
    } else {
      await this.authService.registerWithGoogle();
    }
  }
}
