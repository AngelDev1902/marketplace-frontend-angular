import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ProductService } from '../../../../core/services/product.service';
import { ProductTiersComponent } from '../../components/product-tiers/product-tiers';
import { ProductVariantsComponent } from '../../components/product-variants/product-variants';
import {
  ImageManagerComponent,
  NewImageUpload,
} from '../../../../shared/components/image-manager/image-manager';
import {
  CatalogOptionDto,
  ColorOptionDto,
} from '../../../../shared/models/responses/catalog.response.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import {
  ProductRequest,
  ImagesProductRequest,
} from '../../../../shared/models/requests/product.request.model';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    ProductTiersComponent,
    ProductVariantsComponent,
    ImageManagerComponent,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule,
  ],
  templateUrl: './product-create.html',
})
export class ProductCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly productService = inject(ProductService);

  // Formulario Reactivo
  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    categoryKey: ['', Validators.required],
    basePrice: [0, [Validators.required, Validators.min(0)]],
    tiers: this.fb.array([]),
    variants: this.fb.array([]),
  });
  // Catálogos cargados del backend
  readonly categories = signal<CatalogOptionDto[]>([]);
  readonly sizes = signal<CatalogOptionDto[]>([]);
  readonly colors = signal<ColorOptionDto[]>([]);

  // Estado local para imágenes
  readonly images = signal<NewImageUpload[]>([]);

  // Toggle de variantes
  readonly hasVariants = signal<boolean>(false);

  // Carga y Errores
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  get tiersArray(): FormArray {
    return this.form.get('tiers') as FormArray;
  }

  get variantsArray(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  ngOnInit(): void {
    // Carga paralela de catálogos
    forkJoin({
      categories: this.catalogService.getCategories(),
      sizes: this.catalogService.getSizes(),
      colors: this.catalogService.getColors(),
    }).subscribe({
      next: (res) => {
        this.categories.set(res.categories);
        this.sizes.set(res.sizes);
        this.colors.set(res.colors);
      },
      error: (err) => {
        console.error('Error cargando catálogos:', err);
        this.error.set('No se pudieron cargar los catálogos necesarios para crear un producto.');
      },
    });
  }

  toggleVariants(enabled: boolean): void {
    this.hasVariants.set(enabled);
    if (!enabled) {
      this.variantsArray.clear();
    }
  }

  onImagesChange(newImages: NewImageUpload[]): void {
    this.images.set(newImages);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const fValue = this.form.value;

    const mappedImages: ImagesProductRequest[] = this.images().map((img) => ({
      image: img.base64,
      name: img.file.name,
      isPrimary: img.isPrimary,
      order: img.order,
    }));

    const payload: ProductRequest = {
      name: fValue.name!,
      description: fValue.description || '',
      categoryKey: fValue.categoryKey!,
      basePrice: fValue.basePrice!,
      tiers: (fValue.tiers as any[]) || [],
      variants: this.hasVariants() ? (fValue.variants as any[]) : undefined,
      images: mappedImages.length > 0 ? mappedImages : undefined,
    };

    this.productService
      .createProduct(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/products']);
        },
        error: (err) => {
          console.error('Error al guardar producto:', err);
          this.error.set(err.error?.message || 'Error al guardar el producto. Inténtalo de nuevo.');
        },
      });
  }
}
