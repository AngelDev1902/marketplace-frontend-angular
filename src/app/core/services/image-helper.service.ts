import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageHelperService {
  /**
   * Convierte un archivo local a una cadena Base64 limpia (removiendo el prefijo data:image/*;base64,).
   */
  toBase64(file: File): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        observer.next(base64);
        observer.complete();
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
    });
  }
}
