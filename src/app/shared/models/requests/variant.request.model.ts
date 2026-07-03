export interface ProductVariantRequest {
  sizeKey: string;
  colorKey: string;
  sku: string;
  stockQuantity: number;
  priceAdjustment: number;
  description?: string;
  isActive?: boolean;
}
