import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

export interface LoadedImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface NewImageUpload {
  file: File;
  base64: string;
  order: number;
  isPrimary: boolean;
}

interface LocalNewImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
  order: number;
}

@Component({
  selector: 'app-image-manager',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './image-manager.html',
})
export class ImageManagerComponent {
  /** Entrada inicial de imágenes cargadas */
  readonly initialImages = input<LoadedImage[]>([]);

  /** Estado de guardado global en progreso */
  readonly saving = input(false);

  /** Modo creación: si es verdadero, oculta botones de guardado individual y emite cambios reactivos */
  readonly creationMode = input(false);

  /** Emisiones de acciones */
  readonly uploadNewImages = output<NewImageUpload[]>();
  readonly saveReorderedImages =
    output<{ id: string; isPrimary: boolean; displayOrder: number }[]>();
  readonly deleteImage = output<string>();
  readonly imagesChange = output<NewImageUpload[]>();

  existingImages: LoadedImage[] = [];
  newImages: LocalNewImage[] = [];
  error: string | null = null;
  actionLoading = false;
  draggedIdx: number | null = null;

  constructor(private confirmationService: ConfirmationService) {
    // Sincronizar las imágenes del componente reactivamente cuando cambia la lista inicial
    effect(() => {
      this.initExistingImages();
    });
  }

  private initExistingImages(): void {
    this.existingImages = [...this.initialImages()].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  private normalizeOrders(list: LoadedImage[]): LoadedImage[] {
    return list.map((img, idx) => ({
      ...img,
      displayOrder: idx + 1,
    }));
  }

  // HTML5 Drag and Drop Handlers
  handleDragStart(idx: number): void {
    this.draggedIdx = idx;
  }

  handleDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  handleDrop(targetIdx: number): void {
    if (this.draggedIdx === null || this.draggedIdx === targetIdx) return;

    const updated = [...this.existingImages];
    const draggedItem = updated[this.draggedIdx];

    updated.splice(this.draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);

    const reordered = this.normalizeOrders(updated);
    this.existingImages = reordered.map((img, idx) => ({
      ...img,
      isPrimary: idx === 0,
    }));

    this.draggedIdx = null;
  }

  handleSetPrimary(id: string): void {
    const updated = this.existingImages.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    const sorted = [...updated].sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));
    this.existingImages = this.normalizeOrders(sorted);
  }

  async handleSaveOrder(): Promise<void> {
    this.error = null;
    this.actionLoading = true;
    try {
      const payload = this.existingImages.map((img) => ({
        id: img.id,
        isPrimary: img.isPrimary,
        displayOrder: img.displayOrder,
      }));
      this.saveReorderedImages.emit(payload);
    } catch (err: any) {
      this.error = err?.message || 'Error al guardar el nuevo orden.';
    } finally {
      this.actionLoading = false;
    }
  }

  handleDeleteClick(imageId: string): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta imagen de tu catálogo?',
      header: 'Eliminar Imagen',
      icon: 'pi pi-exclamation-circle',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', text: true },
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      accept: () => {
        this.handleConfirmDelete(imageId);
      },
    });
  }

  async handleConfirmDelete(targetId: string): Promise<void> {
    this.error = null;
    this.actionLoading = true;
    try {
      this.deleteImage.emit(targetId);
    } catch (err: any) {
      this.error = err?.message || 'Error al eliminar la imagen.';
    } finally {
      this.actionLoading = false;
    }
  }

  handleFileChange(e: Event): void {
    const inputEl = e.target as HTMLInputElement;
    const files = inputEl.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    let currentNewImagesCount = this.newImages.length;
    let loadedCount = 0;

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        const orderVal = this.existingImages.length + currentNewImagesCount + 1;
        currentNewImagesCount++;

        const newImgEntry: LocalNewImage = {
          id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl,
          isPrimary: this.existingImages.length === 0 && currentNewImagesCount === 1,
          order: orderVal,
        };

        this.newImages = [...this.newImages, newImgEntry];
        loadedCount++;
        if (loadedCount === filesArray.length && this.creationMode()) {
          this._emitImagesChange();
        }
      };
      reader.readAsDataURL(file);
    });

    inputEl.value = '';
  }

  handleRemoveNewImage(id: string): void {
    const updated = this.newImages.filter((img) => img.id !== id);
    const wasPrimary = this.newImages.find((img) => img.id === id)?.isPrimary;
    const hasExistingPrimary = this.existingImages.some((img) => img.isPrimary);

    if (wasPrimary && updated.length > 0 && !hasExistingPrimary) {
      updated[0].isPrimary = true;
    }

    this.newImages = updated.map((img, idx) => ({
      ...img,
      order: this.existingImages.length + idx + 1,
    }));

    if (this.creationMode()) {
      this._emitImagesChange();
    }
  }

  handleSetPrimaryNewImage(id: string): void {
    this.existingImages = this.existingImages.map((img) => ({ ...img, isPrimary: false }));
    this.newImages = this.newImages.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));

    if (this.creationMode()) {
      this._emitImagesChange();
    }
  }

  async handleUploadClick(): Promise<void> {
    if (this.newImages.length === 0) return;
    this.error = null;
    this.actionLoading = true;
    try {
      const payload: NewImageUpload[] = this.newImages.map((img) => {
        const base64Data = img.previewUrl.split(',')[1] || '';
        return {
          file: img.file,
          base64: base64Data,
          order: img.order,
          isPrimary: img.isPrimary,
        };
      });
      this.uploadNewImages.emit(payload);
      this.newImages = [];
    } catch (err: any) {
      this.error = err?.message || 'Error al subir nuevas imágenes.';
    } finally {
      this.actionLoading = false;
    }
  }

  private _emitImagesChange(): void {
    const payload: NewImageUpload[] = this.newImages.map((img) => {
      const base64Data = img.previewUrl.split(',')[1] || '';
      return {
        file: img.file,
        base64: base64Data,
        order: img.order,
        isPrimary: img.isPrimary,
      };
    });
    this.imagesChange.emit(payload);
  }
}
