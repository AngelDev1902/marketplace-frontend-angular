import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import {
  CatalogOptionDto,
  ColorOptionDto,
} from '../../../../shared/models/responses/catalog.response.model';

@Component({
  selector: 'app-product-variants',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
  ],
  templateUrl: './product-variants.html',
})
export class ProductVariantsComponent {
  private readonly fb = inject(FormBuilder);

  readonly variantsFormArray = input.required<FormArray>();
  readonly sizes = input<CatalogOptionDto[]>([]);
  readonly colors = input<ColorOptionDto[]>([]);

  get variants(): FormGroup[] {
    return this.variantsFormArray().controls as FormGroup[];
  }

  addVariant(): void {
    const variantGroup = this.fb.group({
      sizeKey: ['', Validators.required],
      colorKey: ['', Validators.required],
      sku: ['', Validators.required],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      priceAdjustment: [0, Validators.required],
      description: [''],
      isActive: [true],
    });
    this.variantsFormArray().push(variantGroup);
  }

  removeVariant(index: number): void {
    this.variantsFormArray().removeAt(index);
  }
}
