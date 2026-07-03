import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const LOCAL_STORAGE_KEY = 'marketplace_theme';

/**
 * Maneja el tema global de la app con dos capas:
 * 1. Variables CSS propias (componentes customizados) — controladas por clase `dark` en <html>
 * 2. PrimeNG dark mode nativo — controlado por atributo `data-theme` en <html>
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Signal reactivo del tema actual — persiste en localStorage
  readonly theme = signal<Theme>(this._loadInitialTheme());

  // Computed conveniente para saber si está en dark
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    // Effect que aplica el tema al DOM cada vez que cambia
    effect(() => {
      this._applyTheme(this.theme());
    });
  }

  /**
   * Cambia el tema y persiste la elección
   */
  setTheme(newTheme: Theme): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, newTheme);
    this.theme.set(newTheme);
  }

  /**
   * Toggle conveniente entre light y dark
   */
  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private _loadInitialTheme(): Theme {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Fallback: preferencia del sistema operativo
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private _applyTheme(theme: Theme): void {
    const root = document.documentElement;

    if (theme === 'dark') {
      // Capa 1: variables CSS propias
      root.classList.add('dark');
      // Capa 2: PrimeNG native dark mode selector
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }
}
