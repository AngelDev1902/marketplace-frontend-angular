import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-product-tiers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitchModule,
  ],
  templateUrl: './product-tiers.html',
})
export class ProductTiersComponent {
  private readonly fb = inject(FormBuilder);

  readonly tiersFormArray = input.required<FormArray>();

  get tiers(): FormGroup[] {
    return this.tiersFormArray().controls as FormGroup[];
  }

  addTier(): void {
    const tierGroup = this.fb.group({
      minQuantity: [1, [Validators.required, Validators.min(1)]],
      maxQuantity: [null],
      price: [0, [Validators.required, Validators.min(0)]],
      coversShipping: [false],
    });
    this.tiersFormArray().push(tierGroup);
  }

  removeTier(index: number): void {
    this.tiersFormArray().removeAt(index);
  }
}
