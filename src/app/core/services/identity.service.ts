import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthLoginResponseDto } from '../../shared/models/responses/auth.response.model';
import {
  AuthLoginRequestDto,
  UserRegistrationDto,
} from '../../shared/models/requests/auth.request.model';

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private readonly http = inject(HttpClient);
  private readonly BASE_PATH = `${environment.apiUrl}/public/identity`;

  /**
   * Login usando Firebase Token → JWT del backend
   */
  login(dto: AuthLoginRequestDto): Observable<AuthLoginResponseDto> {
    return this.http.post<AuthLoginResponseDto>(`${this.BASE_PATH}/login`, dto);
  }

  /**
   * Registro de cliente normal
   */
  registerClient(dto: UserRegistrationDto): Observable<AuthLoginResponseDto> {
    return this.http.post<AuthLoginResponseDto>(`${this.BASE_PATH}/register/client`, dto);
  }

  /**
   * Registro específico para Vendedores (Vendor Dashboard)
   */
  registerVendor(dto: UserRegistrationDto): Observable<AuthLoginResponseDto> {
    return this.http.post<AuthLoginResponseDto>(`${this.BASE_PATH}/register/vendor`, dto);
  }
}
