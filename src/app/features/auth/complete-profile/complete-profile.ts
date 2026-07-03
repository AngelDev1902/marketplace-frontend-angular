import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { VendorRegistrationDto } from '../../../shared/models/requests/auth.request.model';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
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
      .input-field[readonly] {
        cursor: not-allowed;
      }
    `,
  ],
})
export class CompleteProfileComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

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
   * Cuando se activa, limpia los campos de dirección (igual que en React)
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
   * Geolocalización del navegador — lógica idéntica al original
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

  async onSubmit(): Promise<void> {
    if (!this.form.get('storeName')?.value) return;
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

    await this.authService.completeVendorProfile(payload);
  }
}
