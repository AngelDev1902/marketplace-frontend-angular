import { Component, OnInit, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ProductService } from '../../../../core/services/product.service';
import { ProductResponse } from '../../../../shared/models/responses/product.response.model';
import { CatalogOptionDto } from '../../../../shared/models/responses/catalog.response.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-edit-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './product-edit-info.html',
})
export class ProductEditInfoModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly productService = inject(ProductService);

  readonly isOpen = input(false);
  readonly product = input<ProductResponse | null>(null);

  readonly onClose = output<void>();
  readonly onSaveSuccess = output<void>();

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    categoryKey: ['', Validators.required],
    gender: ['', Validators.required],
    basePrice: [0, [Validators.required, Validators.min(0)]],
  });

  readonly categories = signal<CatalogOptionDto[]>([]);
  readonly genders = signal<CatalogOptionDto[]>([]);
  readonly loadingCategories = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const prod = this.product();
      if (prod) {
        this.form.patchValue({
          name: prod.name,
          description: prod.description,
          categoryKey: prod.category.value,
          gender: prod.gender.value,
          basePrice: prod.basePrice,
        });
      } else {
        this.form.reset();
      }
    });
  }

  ngOnInit(): void {
    this.loadingCategories.set(true);
    this.catalogService
      .getCategories()
      .pipe(finalize(() => this.loadingCategories.set(false)))
      .subscribe({
        next: (cats) => this.categories.set(cats),
        error: (err) => console.error('Error al cargar categorías:', err),
      });

    this.catalogService.getGenders().subscribe({
      next: (response) => {
        this.genders.set(response);
      },
      error: (err) => console.error('Error al cargar géneros:', err),
    });
  }

  handleClose(): void {
    this.onClose.emit();
  }

  onSubmit(): void {
    const prod = this.product();
    if (!prod) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const fValue = this.form.value;
    const payload: any = {
      name: fValue.name!,
      description: fValue.description || '',
      categoryKey: fValue.categoryKey!,
      basePrice: fValue.basePrice!,
    };

    this.productService
      .updateProduct(prod.uuid, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.onSaveSuccess.emit();
          this.handleClose();
        },
        error: (err) => {
          console.error('Error al actualizar info general:', err);
          this.error.set(err.error?.message || 'Error al guardar la información general.');
        },
      });
  }
}
