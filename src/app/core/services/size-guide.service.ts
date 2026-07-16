import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductSizeGuideUpdateRequest } from '../../shared/models/requests/size-guide.request.model';
import {
  MeasurementUnitResponse,
  SizeGuideTemplateOptionResponse,
  ProductSizeGuideResponse,
  SizeGuideTemplateResponse,
} from '../../shared/models/responses/size-guide.response.model';
import { CatalogOptionDto } from '../../shared/models/responses/catalog.response.model';

@Injectable({
  providedIn: 'root',
})
export class SizeGuideService {
  private readonly http = inject(HttpClient);

  private readonly PUBLIC_BASE = `${environment.apiUrl}/public/catalogs`;
  private readonly VENDOR_BASE = `${environment.apiUrl}/vendor/products`;

  // ─── Public Catalog Endpoints ──────────────────────────────────────────────
  getMeasurementUnits(): Observable<MeasurementUnitResponse[]> {
    return this.http.get<MeasurementUnitResponse[]>(`${this.PUBLIC_BASE}/measurement-units`);
  }

  getMeasurementTypes(): Observable<CatalogOptionDto[]> {
    return this.http.get<CatalogOptionDto[]>(`${this.PUBLIC_BASE}/measurement-types`);
  }

  // ─── Vendor Size Guide Endpoints ───────────────────────────────────────────
  getMyTemplates(): Observable<SizeGuideTemplateOptionResponse[]> {
    return this.http.get<SizeGuideTemplateOptionResponse[]>(
      `${this.VENDOR_BASE}/size-guides/templates`
    );
  }

  getGlobalTemplates(): Observable<SizeGuideTemplateOptionResponse[]> {
    return this.http.get<SizeGuideTemplateOptionResponse[]>(`${this.VENDOR_BASE}/size-guides/global-templates`);
  }

  getTemplateDetails(templateId: string): Observable<SizeGuideTemplateResponse> {
    return this.http.get<SizeGuideTemplateResponse>(`${this.VENDOR_BASE}/size-guides/templates/${templateId}`);
  }

  saveProductSizeGuide(
    productId: string,
    request: ProductSizeGuideUpdateRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.VENDOR_BASE}/${productId}/size-guide`, request);
  }

  getProductSizeGuide(productId: string): Observable<ProductSizeGuideResponse> {
    return this.http.get<ProductSizeGuideResponse>(`${this.VENDOR_BASE}/${productId}/size-guide`);
  }
}
