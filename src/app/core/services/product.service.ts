import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProductRequest,
  ImagesProductRequest,
  ProductImageReorderRequest,
} from '../../shared/models/requests/product.request.model';
import {
  ProductResponse,
  ProductImageResponse,
} from '../../shared/models/responses/product.response.model';
import { ProductVariantRequest } from '../../shared/models/requests/variant.request.model';
import { ProductVariantResponse } from '../../shared/models/responses/variant.response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/vendor/products`;

  getMyProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.BASE);
  }

  createProduct(dto: ProductRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.BASE, dto);
  }

  updateProduct(id: string, dto: ProductRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.BASE}/${id}`, dto);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  // ─── Images ────────────────────────────────────────────────────────────────
  getProductImages(productId: string): Observable<ProductImageResponse[]> {
    return this.http.get<ProductImageResponse[]>(`${this.BASE}/${productId}/images`);
  }

  uploadProductImages(productId: string, images: ImagesProductRequest[]): Observable<void> {
    return this.http.post<void>(`${this.BASE}/${productId}/images`, images);
  }

  deleteProductImage(imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/images/${imageId}`);
  }

  reorderProductImages(productId: string, dto: ProductImageReorderRequest[]): Observable<void> {
    return this.http.put<void>(`${this.BASE}/${productId}/images/reorder`, dto);
  }

  // ─── Variants ─────────────────────────────────────────────────────────────
  getProductVariants(productId: string): Observable<ProductVariantResponse[]> {
    return this.http.get<ProductVariantResponse[]>(`${this.BASE}/${productId}/variants`);
  }

  createProductVariant(
    productId: string,
    dto: ProductVariantRequest
  ): Observable<ProductVariantResponse> {
    return this.http.post<ProductVariantResponse>(`${this.BASE}/${productId}/variants`, dto);
  }

  updateProductVariant(
    productId: string,
    variantId: string,
    dto: ProductVariantRequest
  ): Observable<ProductVariantResponse> {
    return this.http.put<ProductVariantResponse>(
      `${this.BASE}/${productId}/variants/${variantId}`,
      dto
    );
  }

  deleteProductVariant(productId: string, variantId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${productId}/variants/${variantId}`);
  }
}
