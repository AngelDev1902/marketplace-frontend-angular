import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const SESSION_KEY = 'marketplace_vendor_session';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // ─── Request phase: inyectar token ───────────────────────────────────────────
  const sessionStr = localStorage.getItem(SESSION_KEY);
  let authReq = req;

  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session?.accessToken) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
      }
    } catch (e) {
      console.error('Error parseando la sesión:', e);
    }
  }

  // Manejar error 401 (sesión expirada) redireccionando a /auth/login
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Sesión expirada → limpiar y redirigir
        localStorage.removeItem(SESSION_KEY);
        window.location.href = '/auth/login';
      }
      return throwError(() => error);
    })
  );
};
