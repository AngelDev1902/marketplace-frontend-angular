import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductService } from '../../../core/services/product.service';
import {
  ProductResponse,
  ProductImageResponse,
} from '../../../shared/models/responses/product.response.model';
import {
  ImageManagerComponent,
  NewImageUpload,
} from '../../../shared/components/image-manager/image-manager';

@Component({
  selector: 'app-product-image-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ProgressSpinnerModule, ImageManagerComponent],
  templateUrl: './product-image-modal.html',
})
export class ProductImageModalComponent {
  private readonly productService = inject(ProductService);

  /** Inputs como signals */
  readonly isOpen = input(false);
  readonly product = input<ProductResponse | null>(null);

  /** Outputs como emisores */
  readonly onClose = output<void>();
  readonly onSaveSuccess = output<void>();

  // Estados reactivos internos del modal
  readonly existingImages = signal<ProductImageResponse[]>([]);
  readonly loadingImages = signal(false);
  readonly saving = signal(false);
  readonly modalError = signal<string | null>(null);

  // Mapeo automático de imágenes cargadas para el componente ImageManager
  readonly mappedImages = computed(() => {
    return this.existingImages().map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      isPrimary: img.isPrimary,
      displayOrder: img.displayOrder,
    }));
  });

  constructor() {
    // Escucha de apertura para cargar imágenes reactivamente
    effect(() => {
      const open = this.isOpen();
      const prod = this.product();

      if (open && prod) {
        this.fetchExistingImages();
      } else {
        this.existingImages.set([]);
        this.modalError.set(null);
      }
    });
  }

  handleClose(): void {
    this.onClose.emit();
  }

  fetchExistingImages(): void {
    const prod = this.product();
    if (!prod) return;

    this.loadingImages.set(true);
    this.modalError.set(null);
    this.productService.getProductImages(prod.uuid).subscribe({
      next: (images) => {
        this.existingImages.set([...images].sort((a, b) => a.displayOrder - b.displayOrder));
        this.loadingImages.set(false);
      },
      error: (err) => {
        console.error(err);
        this.modalError.set('No se pudieron cargar las imágenes de este producto.');
        this.loadingImages.set(false);
      },
    });
  }

  handleUploadNewImages(newImages: NewImageUpload[]): void {
    const prod = this.product();
    if (!prod) return;

    this.saving.set(true);
    this.modalError.set(null);

    const payload = newImages.map((img) => ({
      image: img.base64,
      name: img.file.name,
      isPrimary: img.isPrimary,
      order: img.order,
    }));

    this.productService.uploadProductImages(prod.uuid, payload).subscribe({
      next: () => {
        this.fetchExistingImages();
        this.onSaveSuccess.emit();
        this.saving.set(false);
      },
      error: (err) => {
        console.error(err);
        this.modalError.set(
          err.response?.data?.message || 'Error al subir las imágenes al servidor.'
        );
        this.saving.set(false);
      },
    });
  }

  handleSaveReorderedImages(
    reorderedImages: { id: string; isPrimary: boolean; displayOrder: number }[]
  ): void {
    const prod = this.product();
    if (!prod) return;

    this.saving.set(true);
    this.modalError.set(null);

    this.productService.reorderProductImages(prod.uuid, reorderedImages).subscribe({
      next: () => {
        this.fetchExistingImages();
        this.onSaveSuccess.emit();
        this.saving.set(false);
      },
      error: (err) => {
        console.error(err);
        this.modalError.set(
          err.response?.data?.message || 'Error al guardar el orden de las imágenes.'
        );
        this.saving.set(false);
      },
    });
  }

  handleDeleteImage(imageId: string): void {
    this.saving.set(true);
    this.modalError.set(null);

    this.productService.deleteProductImage(imageId).subscribe({
      next: () => {
        this.fetchExistingImages();
        this.onSaveSuccess.emit();
        this.saving.set(false);
      },
      error: (err) => {
        console.error(err);
        this.modalError.set(
          err.response?.data?.message || 'Error al eliminar la imagen del servidor.'
        );
        this.saving.set(false);
      },
    });
  }
}
