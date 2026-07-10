import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService } from 'primeng/api';
import { ProductResponse } from '../../../../shared/models/responses/product.response.model';
import { ProductService } from '../../../../core/services/product.service';
import { ProductImageModalComponent } from '../../product-image-modal/product-image-modal';
import { ProductEditInfoModalComponent } from '../../components/product-edit-info/product-edit-info';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    ProgressSpinnerModule,
    MenuModule,
    ProductImageModalComponent,
    ProductEditInfoModalComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './product-list.html',
})
export class ProductListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly productService = inject(ProductService);

  readonly editItems = [
    {
      label: 'Información General',
      icon: 'pi pi-info-circle',
      command: () => {
        this.isEditModalOpen.set(true);
      },
    },
    {
      label: 'Editar escalas de mayoreo',
      icon: 'pi pi-percentage',
      command: () => {
        // Fases futuras
      },
    },
    {
      label: 'Editar variantes',
      icon: 'pi pi-clone',
      command: () => {
        // Fases futuras
      },
    },
  ];

  readonly Number = Number;

  // Estado del componente usando Signals para optimizar la detección de cambios
  readonly products = signal<ProductResponse[]>([]);
  readonly loading = signal<boolean>(true);
  readonly deleting = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Estados de control para Modales (Abierto/Cerrado y producto seleccionado)
  readonly selectedProduct = signal<ProductResponse | null>(null);
  readonly isModalOpen = signal<boolean>(false);

  readonly selectedProductForVariants = signal<ProductResponse | null>(null);
  readonly isVariantModalOpen = signal<boolean>(false);

  readonly selectedProductForEdit = signal<ProductResponse | null>(null);
  readonly isEditModalOpen = signal<boolean>(false);

  // --- Cálculos de estadísticas optimizados mediante Computed Signals ---
  readonly registeredCount = computed(() => this.products().length);
  readonly activeCount = computed(
    () => this.products().filter((p) => p.status?.value === 'ACTIVO').length
  );
  readonly totalStock = computed(() =>
    this.products().reduce((acc, p) => acc + (p.totalStock || 0), 0)
  );

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getMyProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(
          err.response?.data?.message ||
            'No se pudieron cargar los productos. Por favor, intenta de nuevo.'
        );
        this.loading.set(false);
      },
    });
  }

  handleCreateClick(): void {
    this.router.navigate(['/dashboard/products/new']);
  }

  // Desencadenadores de Modal de Imágenes
  handleOpenModal(product: ProductResponse): void {
    this.selectedProduct.set(product);
    this.isModalOpen.set(true);
  }

  handleCloseModal(): void {
    this.isModalOpen.set(false);
    this.selectedProduct.set(null);
  }

  // Desencadenadores de Modal de Variantes
  handleOpenVariantModal(product: ProductResponse): void {
    this.selectedProductForVariants.set(product);
    this.isVariantModalOpen.set(true);
  }

  handleCloseVariantModal(): void {
    this.isVariantModalOpen.set(false);
    this.selectedProductForVariants.set(null);
  }

  // Desencadenadores de Modal de Edición
  handleOpenEditModal(product: ProductResponse): void {
    this.selectedProductForEdit.set(product);
    this.isEditModalOpen.set(true);
  }

  handleCloseEditModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedProductForEdit.set(null);
  }

  // Confirmación nativa de Eliminación Lógica mediante PrimeNG ConfirmDialog
  handleDeleteProductClick(productId: string): void {
    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar este producto? Se ocultará permanentemente de tu catálogo de ventas.',
      header: 'Eliminar Producto',
      icon: 'pi pi-exclamation-triangle text-amber-500 text-2xl',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        text: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },
      accept: () => {
        this.handleConfirmDeleteProduct(productId);
      },
    });
  }

  private handleConfirmDeleteProduct(targetId: string): void {
    this.deleting.set(true);
    this.error.set(null);
    this.productService.deleteProduct(targetId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.fetchProducts();
      },
      error: (err) => {
        console.error(err);
        this.error.set(err.response?.data?.message || 'No se pudo eliminar el producto.');
        this.deleting.set(false);
      },
    });
  }
}
