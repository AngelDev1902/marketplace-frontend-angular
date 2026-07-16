import { CatalogOptionDto } from './catalog.response.model';

export interface ProductImageResponse {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductResponse {
  uuid: string;
  category: CatalogOptionDto;
  gender: CatalogOptionDto;
  name: string;
  description: string;
  basePrice: number;
  imagePrimary: ProductImageResponse | null;
  totalStock: number;
  status: CatalogOptionDto;
  quantityVariants: number;
}

export interface ProductWholesaleTierResponse {
  id: string;
  minQuantity: number;
  maxQuantity: number | null;
  unitPrice: number;
  coversShipping: boolean;
}

