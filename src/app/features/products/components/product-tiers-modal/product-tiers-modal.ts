import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductService } from '../../../../core/services/product.service';
import {
  ProductResponse,
  ProductWholesaleTierResponse,
} from '../../../../shared/models/responses/product.response.model';
import { ProductWholesaleTierRequest } from '../../../../shared/models/requests/wholesale.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-tiers-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    ToggleSwitchModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './product-tiers-modal.html',
})
export class ProductTiersModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  readonly isOpen = input(false);
  readonly product = input<ProductResponse | null>(null);

  readonly onClose = output<void>();
  readonly onSaveSuccess = output<void>();

  // States
  readonly tiers = signal<ProductWholesaleTierResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Form State
  readonly isFormOpen = signal(false);
  readonly editingTier = signal<ProductWholesaleTierResponse | null>(null);

  readonly form = this.fb.group({
    minQuantity: [1, [Validators.required, Validators.min(1)]],
    maxQuantity: [null as number | null],
    unitPrice: [0, [Validators.required, Validators.min(0.01)]],
    coversShipping: [false],
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const prod = this.product();

      if (open && prod) {
        this.fetchTiers();
      } else {
        this.resetState();
      }
    });
  }

  fetchTiers(): void {
    const prod = this.product();
    if (!prod) return;

    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProductWholesaleTiers(prod.uuid)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.tiers.set([...data].sort((a, b) => a.minQuantity - b.minQuantity));
        },
        error: (err) => {
          console.error('Error fetching tiers:', err);
          this.error.set('No se pudieron cargar las escalas de mayoreo.');
        },
      });
  }

  resetState(): void {
    this.tiers.set([]);
    this.error.set(null);
    this.closeForm();
  }

  handleClose(): void {
    this.onClose.emit();
  }

  openAddForm(): void {
    this.editingTier.set(null);
    this.form.reset({
      minQuantity: 1,
      maxQuantity: null,
      unitPrice: 0,
      coversShipping: false,
    });
    this.isFormOpen.set(true);
  }

  openEditForm(tier: ProductWholesaleTierResponse): void {
    this.editingTier.set(tier);
    this.form.patchValue({
      minQuantity: tier.minQuantity,
      maxQuantity: tier.maxQuantity,
      unitPrice: tier.unitPrice,
      coversShipping: tier.coversShipping,
    });
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingTier.set(null);
    this.form.reset();
  }

  onSubmit(): void {
    const prod = this.product();
    if (!prod || this.form.invalid) return;

    const val = this.form.value;
    const minQ = val.minQuantity!;
    const maxQ = val.maxQuantity ?? null;

    if (maxQ !== null && maxQ <= minQ) {
      this.error.set('La cantidad máxima debe ser mayor que la cantidad mínima.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload: ProductWholesaleTierRequest = {
      minQuantity: minQ,
      maxQuantity: maxQ,
      unitPrice: val.unitPrice!,
      coversShipping: val.coversShipping ?? false,
    };

    const editTier = this.editingTier();
    const request$ = editTier
      ? this.productService.updateWholesaleTier(editTier.id, payload)
      : this.productService.addWholesaleTier(prod.uuid, payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.fetchTiers();
        this.closeForm();
        this.onSaveSuccess.emit();
      },
      error: (err) => {
        console.error('Error saving tier:', err);
        this.error.set(err.error?.message || 'Error al guardar la escala de mayoreo.');
      },
    });
  }

  deleteTier(tierId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta escala de mayoreo?')) return;

    this.saving.set(true);
    this.error.set(null);

    this.productService
      .deleteWholesaleTier(tierId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.fetchTiers();
          this.onSaveSuccess.emit();
        },
        error: (err) => {
          console.error('Error deleting tier:', err);
          this.error.set('No se pudo eliminar la escala de mayoreo.');
        },
      });
  }
}
