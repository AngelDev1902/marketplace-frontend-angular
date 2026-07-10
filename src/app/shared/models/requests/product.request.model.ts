import { ProductVariantRequest } from './variant.request.model';
import { ProductsWholesaleTier } from './wholesale.model';

export interface ProductRequest {
  name: string;
  description: string;
  categoryKey: string;
  gender: string;
  basePrice: number;
  tiers: ProductsWholesaleTier[];
  images?: ImagesProductRequest[];
  variants?: ProductVariantRequest[];
}

export interface ImagesProductRequest {
  image: string; // Base64 string representation of byte[]
  name: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductImageReorderRequest {
  id: string;
  displayOrder: number;
  isPrimary: boolean;
}
