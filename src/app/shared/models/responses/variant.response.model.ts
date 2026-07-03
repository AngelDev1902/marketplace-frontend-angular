export interface ProductVariantResponse {
  id: string;
  sizeKey: string;
  sizeName: string;
  colorKey: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stockQuantity: number;
  priceAdjustment: number;
  description: string;
  isActive: boolean;
}
