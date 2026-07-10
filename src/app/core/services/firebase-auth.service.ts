import { Injectable, inject } from '@angular/core';
import { Observable, defer, switchMap, throwError } from 'rxjs';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { IdentityService } from './identity.service';
import { VendorProfileService } from './vendor-profile.service';
import { AuthLoginResponseDto } from '../../shared/models/responses/auth.response.model';
import {
  UserRegistrationDto,
  VendorRegistrationDto,
} from '../../shared/models/requests/auth.request.model';

const firebaseApp = initializeApp(environment.firebase);
const firebaseAuth = getAuth(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private readonly identityService = inject(IdentityService);
  private readonly vendorProfileService = inject(VendorProfileService);

  /**
   * Login con Google
   */
  loginWithGoogle(): Observable<AuthLoginResponseDto> {
    const provider = new GoogleAuthProvider();
    return defer(() => signInWithPopup(firebaseAuth, provider)).pipe(
      switchMap((result) => defer(() => result.user.getIdToken())),
      switchMap((firebaseToken) => this.identityService.login({ firebaseToken }))
    );
  }

  /**
   * Registro con Google
   */
  registerWithGoogle(): Observable<AuthLoginResponseDto> {
    const provider = new GoogleAuthProvider();
    return defer(() => signInWithPopup(firebaseAuth, provider)).pipe(
      switchMap((result) =>
        defer(() => result.user.getIdToken()).pipe(
          switchMap((firebaseToken) => {
            const payload: UserRegistrationDto = {
              email: result.user.email ?? '',
              firebaseToken,
              firstName: result.user.displayName ?? '',
              lastName: result.user.displayName ?? '',
              phoneNumber: result.user.phoneNumber ?? '',
            };
            return this.identityService.registerVendor(payload);
          })
        )
      )
    );
  }

  /**
   * Login con Email/Password
   */
  loginWithEmail(email: string, password: string): Observable<AuthLoginResponseDto> {
    return defer(() => signInWithEmailAndPassword(firebaseAuth, email, password)).pipe(
      switchMap((result) => defer(() => result.user.getIdToken())),
      switchMap((firebaseToken) => this.identityService.login({ firebaseToken }))
    );
  }

  /**
   * Registro con Email/Password
   */
  registerWithEmail(
    vendorData: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
    },
    password: string
  ): Observable<AuthLoginResponseDto> {
    return defer(() =>
      createUserWithEmailAndPassword(firebaseAuth, vendorData.email, password)
    ).pipe(
      switchMap((result) =>
        defer(() => result.user.getIdToken()).pipe(
          switchMap((firebaseToken) => {
            const payload: UserRegistrationDto = {
              email: result.user.email ?? vendorData.email,
              firebaseToken,
              firstName: vendorData.firstName,
              lastName: vendorData.lastName,
              phoneNumber: vendorData.phoneNumber,
            };
            return this.identityService.registerVendor(payload);
          })
        )
      )
    );
  }

  /**
   * Completa el perfil del vendedor (onboarding paso 2)
   */
  completeProfile(vendorData: VendorRegistrationDto): Observable<AuthLoginResponseDto> {
    return this.vendorProfileService.completeProfile(vendorData).pipe(
      switchMap(() => {
        const firebaseUser = firebaseAuth.currentUser;
        if (firebaseUser) {
          return defer(() => firebaseUser.getIdToken(true)).pipe(
            switchMap((firebaseToken) => this.identityService.login({ firebaseToken }))
          );
        } else {
          return throwError(() => new Error('No se encontró sesión de usuario en Firebase'));
        }
      })
    );
  }

  /**
   * Cierra sesión en Firebase
   */
  logout(): Observable<void> {
    return defer(() => signOut(firebaseAuth));
  }
}
