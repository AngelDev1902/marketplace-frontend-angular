import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductService } from '../../../../core/services/product.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ProductResponse } from '../../../../shared/models/responses/product.response.model';
import { ProductVariantResponse } from '../../../../shared/models/responses/variant.response.model';
import {
  CatalogOptionDto,
  ColorOptionDto,
} from '../../../../shared/models/responses/catalog.response.model';
import { ProductVariantRequest } from '../../../../shared/models/requests/variant.request.model';
import { finalize, forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-variants-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './product-variants-modal.html',
})
export class ProductVariantsModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly catalogService = inject(CatalogService);

  readonly isOpen = input(false);
  readonly product = input<ProductResponse | null>(null);

  readonly onClose = output<void>();
  readonly onSaveSuccess = output<void>();

  // States
  readonly variants = signal<ProductVariantResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Catalogs
  readonly sizes = signal<CatalogOptionDto[]>([]);
  readonly colors = signal<ColorOptionDto[]>([]);
  readonly loadingCatalogs = signal(false);

  // Form State
  readonly isFormOpen = signal(false);
  readonly editingVariant = signal<ProductVariantResponse | null>(null);

  readonly form = this.fb.group({
    sizeKey: ['', Validators.required],
    colorKey: ['', Validators.required],
    sku: ['', Validators.required],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    priceAdjustment: [0, Validators.required],
    description: [''],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const prod = this.product();

      if (open && prod) {
        this.fetchVariants();
        this.loadCatalogsIfNeeded();
      } else {
        this.resetState();
      }
    });
  }

  fetchVariants(): void {
    const prod = this.product();
    if (!prod) return;

    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProductVariants(prod.uuid)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.variants.set(data);
        },
        error: (err) => {
          console.error('Error fetching variants:', err);
          this.error.set('No se pudieron cargar las variantes del producto.');
        },
      });
  }

  loadCatalogsIfNeeded(): void {
    if (this.sizes().length > 0 && this.colors().length > 0) return;

    this.loadingCatalogs.set(true);
    forkJoin({
      sizes: this.catalogService.getSizes(),
      colors: this.catalogService.getColors(),
    })
      .pipe(finalize(() => this.loadingCatalogs.set(false)))
      .subscribe({
        next: (res) => {
          this.sizes.set(res.sizes);
          this.colors.set(res.colors);
        },
        error: (err) => {
          console.error('Error loading catalogs for variants:', err);
          this.error.set('Error al cargar los catálogos de tallas y colores.');
        },
      });
  }

  resetState(): void {
    this.variants.set([]);
    this.error.set(null);
    this.closeForm();
  }

  handleClose(): void {
    this.onClose.emit();
  }

  openAddForm(): void {
    this.editingVariant.set(null);
    this.form.reset({
      sizeKey: '',
      colorKey: '',
      sku: '',
      stockQuantity: 0,
      priceAdjustment: 0,
      description: '',
      isActive: true,
    });
    this.isFormOpen.set(true);
  }

  openEditForm(variant: ProductVariantResponse): void {
    this.editingVariant.set(variant);
    this.form.patchValue({
      sizeKey: variant.sizeKey,
      colorKey: variant.colorKey,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      priceAdjustment: variant.priceAdjustment,
      description: variant.description,
      isActive: variant.isActive,
    });
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingVariant.set(null);
    this.form.reset();
  }

  onSubmit(): void {
    const prod = this.product();
    if (!prod || this.form.invalid) return;

    this.saving.set(true);
    this.error.set(null);

    const val = this.form.value;
    const payload: ProductVariantRequest = {
      sizeKey: val.sizeKey!,
      colorKey: val.colorKey!,
      sku: val.sku!,
      stockQuantity: val.stockQuantity!,
      priceAdjustment: val.priceAdjustment!,
      description: val.description || '',
      isActive: val.isActive ?? true,
    };

    const editVariant = this.editingVariant();
    const request$ = editVariant
      ? this.productService.updateProductVariant(prod.uuid, editVariant.id, payload)
      : this.productService.createProductVariant(prod.uuid, payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.fetchVariants();
        this.closeForm();
        this.onSaveSuccess.emit();
      },
      error: (err) => {
        console.error('Error saving variant:', err);
        this.error.set(err.error?.message || 'Error al guardar la variante de producto.');
      },
    });
  }

  deleteVariant(variantId: string): void {
    const prod = this.product();
    if (!prod) return;

    if (!confirm('¿Estás seguro de que deseas eliminar esta variante de producto?')) return;

    this.saving.set(true);
    this.error.set(null);

    this.productService
      .deleteProductVariant(prod.uuid, variantId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.fetchVariants();
          this.onSaveSuccess.emit();
        },
        error: (err) => {
          console.error('Error deleting variant:', err);
          this.error.set('No se pudo eliminar la variante de producto.');
        },
      });
  }
}
