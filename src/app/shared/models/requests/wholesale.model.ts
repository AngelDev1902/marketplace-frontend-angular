export interface ProductsWholesaleTier {
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
  coversShipping: boolean;
}

export interface ProductWholesaleTierRequest {
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
  coversShipping: boolean;
}

