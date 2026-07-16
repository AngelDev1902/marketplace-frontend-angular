import { Component, inject, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SizeGuideService } from '../../../../core/services/size-guide.service';
import { CatalogService } from '../../../../core/services/catalog.service';
import { ProductResponse } from '../../../../shared/models/responses/product.response.model';
import {
  MeasurementUnitResponse,
  SizeGuideTemplateOptionResponse,
  ProductSizeGuideResponse,
  SizeGuideTemplateResponse,
} from '../../../../shared/models/responses/size-guide.response.model';
import { CatalogOptionDto } from '../../../../shared/models/responses/catalog.response.model';
import {
  ProductSizeGuideUpdateRequest,
  CustomSizeGuideRequest,
  SizeGuideRowRequest,
} from '../../../../shared/models/requests/size-guide.request.model';
import { finalize, forkJoin } from 'rxjs';

interface CustomCell {
  min: number | null;
  max: number | null;
}

interface CustomRow {
  sizeKey: string;
  sizeName: string;
  values: { [columnKey: string]: CustomCell };
}

@Component({
  selector: 'app-product-size-guide-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    InputNumberModule,
    ProgressSpinnerModule,
    ToggleSwitchModule,
  ],
  templateUrl: './product-size-guide-modal.html',
})
export class ProductSizeGuideModalComponent {
  private readonly sizeGuideService = inject(SizeGuideService);
  private readonly catalogService = inject(CatalogService);

  readonly isOpen = input(false);
  readonly product = input<ProductResponse | null>(null);

  readonly onClose = output<void>();
  readonly onSaveSuccess = output<void>();

  // Catalogs
  readonly defaultTemplates = signal<SizeGuideTemplateOptionResponse[]>([]);
  readonly userTemplates = signal<SizeGuideTemplateOptionResponse[]>([]);
  readonly units = signal<MeasurementUnitResponse[]>([]);
  readonly measurementTypes = signal<CatalogOptionDto[]>([]);
  readonly sizes = signal<CatalogOptionDto[]>([]);

  // States
  readonly loading = signal(false);
  readonly loadingTemplate = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  // Current product size guide state
  readonly isCustom = signal(false);
  readonly selectedTemplateId = signal<string | null>(null);
  readonly selectedTemplateDetails = signal<SizeGuideTemplateResponse | null>(null);
  readonly selectedUnitKey = signal<string | null>(null);
  readonly selectedColumns = signal<string[]>([]);
  readonly customRows = signal<CustomRow[]>([]);

  // Preview computed signal for rendering the selected template preview
  readonly templatePreview = computed(() => {
    const details = this.selectedTemplateDetails();
    if (!details || !details.guideData) return null;

    return {
      columns: details.guideData.columns,
      rows: details.guideData.rows.map((r: any) => ({
        sizeKey: r.sizeKey,
        values: r.values
      }))
    };
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const prod = this.product();

      if (open && prod) {
        this.loadAllData();
      } else {
        this.resetState();
      }
    });
  }

  loadAllData(): void {
    const prod = this.product();
    if (!prod) return;

    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      sizes: this.catalogService.getSizes(),
      units: this.sizeGuideService.getMeasurementUnits(),
      measurementTypes: this.sizeGuideService.getMeasurementTypes(),
      userTemplates: this.sizeGuideService.getMyTemplates(),
      globalTemplates: this.sizeGuideService.getGlobalTemplates(),
      productGuide: this.sizeGuideService.getProductSizeGuide(prod.uuid),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: any) => {
          this.sizes.set(res.sizes);
          this.units.set(res.units);
          this.measurementTypes.set(res.measurementTypes);
          this.userTemplates.set(res.userTemplates);
          this.defaultTemplates.set(res.globalTemplates);

          this.initializeGuide(res.productGuide, res.sizes);
        },
        error: (err: any) => {
          console.error('Error loading size guide data:', err);
          this.error.set('Error al cargar la configuración de la guía de tallas.');
        },
      });
  }

  initializeGuide(guide: ProductSizeGuideResponse | null, sizes: CatalogOptionDto[]): void {
    // Initialize base rows structures for all catalog sizes
    const initialRows: CustomRow[] = sizes.map((s) => ({
      sizeKey: s.value,
      sizeName: s.label,
      values: {},
    }));

    if (guide) {
      this.isCustom.set(guide.isCustom);
      this.selectedTemplateId.set(guide.sizeGuideTemplateId);
      this.selectedUnitKey.set(guide.sizeGuideUnitKey);

      if (!guide.isCustom && guide.sizeGuideTemplateId) {
        this.fetchTemplateDetails(guide.sizeGuideTemplateId);
      }

      if (guide.isCustom && guide.customSizeGuide) {
        this.selectedColumns.set(guide.customSizeGuide.columns || []);

        // Fill custom rows values
        guide.customSizeGuide.rows.forEach((row: any) => {
          const matchRow = initialRows.find((r) => r.sizeKey === row.sizeKey);
          if (matchRow) {
            matchRow.values = {};
            Object.keys(row.values).forEach((col) => {
              matchRow.values[col] = {
                min: row.values[col].min,
                max: row.values[col].max,
              };
            });
          }
        });
      }
    } else {
      this.isCustom.set(false);
      this.selectedTemplateId.set(null);
      this.selectedTemplateDetails.set(null);
      this.selectedUnitKey.set(null);
      this.selectedColumns.set([]);
    }

    this.customRows.set(initialRows);
  }

  resetState(): void {
    this.isCustom.set(false);
    this.selectedTemplateId.set(null);
    this.selectedTemplateDetails.set(null);
    this.selectedUnitKey.set(null);
    this.selectedColumns.set([]);
    this.customRows.set([]);
    this.error.set(null);
  }

  toggleCustom(value: boolean): void {
    this.isCustom.set(value);
    if (value) {
      this.selectedTemplateId.set(null);
      this.selectedTemplateDetails.set(null);
    }
  }

  fetchTemplateDetails(templateId: string): void {
    this.loadingTemplate.set(true);
    this.sizeGuideService.getTemplateDetails(templateId)
      .pipe(finalize(() => this.loadingTemplate.set(false)))
      .subscribe({
        next: (details: any) => {
          this.selectedTemplateDetails.set(details);
        },
        error: (err: any) => {
          console.error('Error fetching template details:', err);
          this.error.set('No se pudieron cargar los detalles de la plantilla.');
        }
      });
  }

  handleClose(): void {
    this.onClose.emit();
  }

  onTemplateChange(type: 'default' | 'user', id: string | null): void {
    if (!id) {
      this.selectedTemplateId.set(null);
      this.selectedTemplateDetails.set(null);
      return;
    }
    this.selectedTemplateId.set(id);
    this.isCustom.set(false);
    this.fetchTemplateDetails(id);
  }

  getCellValue(row: CustomRow, column: string, type: 'min' | 'max'): number | null {
    if (!row.values[column]) {
      row.values[column] = { min: null, max: null };
    }
    return row.values[column][type];
  }

  setCellValue(row: CustomRow, column: string, type: 'min' | 'max', value: number | null): void {
    if (!row.values[column]) {
      row.values[column] = { min: null, max: null };
    }
    row.values[column][type] = value;
  }

  onSubmit(): void {
    const prod = this.product();
    if (!prod) return;

    this.saving.set(true);
    this.error.set(null);

    let payload: ProductSizeGuideUpdateRequest;

    if (this.isCustom()) {
      const rowsPayload: SizeGuideRowRequest[] = this.customRows()
        .map((r) => {
          const rowValues: { [col: string]: { min: number; max: number } } = {};
          this.selectedColumns().forEach((col) => {
            const cell = r.values[col];
            if (cell && (cell.min !== null || cell.max !== null)) {
              rowValues[col] = {
                min: cell.min!,
                max: cell.max!,
              };
            }
          });
          return {
            sizeKey: r.sizeKey,
            values: rowValues as any,
          };
        })
        .filter((r) => Object.keys(r.values).length > 0);

      payload = {
        isCustom: true,
        sizeGuideTemplateId: null,
        sizeGuideUnitKey: this.selectedUnitKey(),
        customSizeGuide: {
          columns: this.selectedColumns(),
          rows: rowsPayload,
        },
        urlSizeGuide: null,
      };
    } else {
      payload = {
        isCustom: false,
        sizeGuideTemplateId: this.selectedTemplateId(),
        sizeGuideUnitKey: null,
        customSizeGuide: null,
        urlSizeGuide: null,
      };
    }

    this.sizeGuideService
      .saveProductSizeGuide(prod.uuid, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.onSaveSuccess.emit();
          this.handleClose();
        },
        error: (err: any) => {
          console.error('Error saving size guide:', err);
          this.error.set(err.error?.message || 'Error al guardar la guía de tallas.');
        },
      });
  }
}
