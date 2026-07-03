export interface ProductsWholesaleTier {
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
  coversShipping: boolean;
}
