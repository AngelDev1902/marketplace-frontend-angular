import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FirebaseAuthService } from '../../../core/services/firebase-auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { VendorRegistrationDto } from '../../../shared/models/requests/auth.request.model';
import { finalize } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    ToggleSwitchModule,
  ],
  templateUrl: './complete-profile.html',
})
export class CompleteProfileComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  private readonly firebaseAuthService = inject(FirebaseAuthService);
  private readonly themeService = inject(ThemeService);
  private readonly fb = inject(FormBuilder);

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

  // Signals de estado
  readonly sellOnline = signal(false);
  readonly geoLoading = signal(false);

  // Formulario reactivo (equivalente al useState<VendorRegistrationDto>)
  readonly form = this.fb.group({
    storeName: ['', Validators.required],
    street: [''],
    exteriorNumber: [''],
    zone: [''],
    aisle: [''],
    localNumber: [''],
    latitude: [''],
    longitude: [''],
  });

  /**
   * Toggle del switch "Vendo online"
   * Cuando se activa, limpia los campos de dirección
   */
  toggleSellOnline(): void {
    const next = !this.sellOnline();
    this.sellOnline.set(next);
    if (next) {
      this.form.patchValue({
        street: '',
        exteriorNumber: '',
        zone: '',
        aisle: '',
        localNumber: '',
        latitude: '',
        longitude: '',
      });
    }
  }

  /**
   * Geolocalización del navegador
   */
  getLocation(): void {
    if (!navigator.geolocation) {
      alert('La geolocalización no es soportada por tu navegador.');
      return;
    }

    this.geoLoading.set(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.form.patchValue({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        this.geoLoading.set(false);
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        alert('No se pudo obtener la ubicación. Por favor, asegúrate de haber dado los permisos.');
        this.geoLoading.set(false);
      }
    );
  }

  onSubmit(): void {
    if (!this.form.get('storeName')?.value) return;
    this.authService.setLoading(true);
    this.authService.clearError();
    const v = this.form.value;

    const payload: VendorRegistrationDto = {
      storeName: v.storeName!,
      sellOnline: this.sellOnline(),
      street: v.street || undefined,
      exteriorNumber: v.exteriorNumber || undefined,
      zone: v.zone || undefined,
      aisle: v.aisle || undefined,
      localNumber: v.localNumber || undefined,
      latitude: v.latitude ? parseFloat(v.latitude) : undefined,
      longitude: v.longitude ? parseFloat(v.longitude) : undefined,
    };

    this.firebaseAuthService
      .completeProfile(payload)
      .pipe(finalize(() => this.authService.setLoading(false)))
      .subscribe({
        next: (response) => {
          this.authService.setSession(response);
        },
        error: (err) => {
          this.authService.setError(err.message || 'Error al completar el perfil del negocio');
        },
      });
  }
}
