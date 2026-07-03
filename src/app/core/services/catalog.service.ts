import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CatalogOptionDto,
  ColorOptionDto,
} from '../../shared/models/responses/catalog.response.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/public/catalog`;

  getCategories(): Observable<CatalogOptionDto[]> {
    return this.http.get<CatalogOptionDto[]>(`${this.BASE}/categories`);
  }

  getSizes(): Observable<CatalogOptionDto[]> {
    return this.http.get<CatalogOptionDto[]>(`${this.BASE}/sizes`);
  }

  getColors(): Observable<ColorOptionDto[]> {
    return this.http.get<ColorOptionDto[]>(`${this.BASE}/colors`);
  }
}
