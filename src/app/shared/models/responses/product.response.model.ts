import { CatalogOptionDto } from './catalog.response.model';

export interface ProductImageResponse {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductResponse {
  uuid: string;
  categoryKey: string;
  name: string;
  description: string;
  basePrice: number;
  imagePrimary: ProductImageResponse | null;
  totalStock: number;
  status: CatalogOptionDto;
  quantityVariants: number;
}
