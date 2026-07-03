import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VendorRegistrationDto } from '../../shared/models/requests/auth.request.model';
import { CompleteProfileResponseDto } from '../../shared/models/responses/auth.response.model';

/**
 * VendorProfileService — equivalente a services/api/vendorProfileService.ts
 * Peticiones a /api/v1/vendor/profile (requiere JWT válido)
 */
@Injectable({ providedIn: 'root' })
export class VendorProfileService {
  private readonly http = inject(HttpClient);
  private readonly BASE_PATH = `${environment.apiUrl}/vendor/profile`;

  /**
   * Completa el perfil de un vendedor en estado PENDIENTE
   */
  completeProfile(dto: VendorRegistrationDto): Observable<CompleteProfileResponseDto> {
    return this.http.post<CompleteProfileResponseDto>(`${this.BASE_PATH}/complete`, dto);
  }
}
