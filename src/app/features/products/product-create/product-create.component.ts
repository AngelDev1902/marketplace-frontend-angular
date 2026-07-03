import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * ProductCreateComponent
 *
 * Placeholder funcional con estructura de la pantalla de creación.
 * La implementación completa del formulario complejo (variantes, imágenes,
 * precios mayoreo) está contemplada como extensión de la migración.
 *
 * Muestra la estructura de navegación y el estado "en construcción"
 * de forma clara para el usuario.
 */
@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-6 animate-fade-in">

      <!-- Breadcrumb / Header -->
      <div class="flex items-center gap-3 mb-6">
        <a
          routerLink="/dashboard/products"
          class="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] rounded-lg transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">Nuevo Producto</h1>
          <p class="text-sm text-[var(--text-secondary)]">Completa los datos para publicar tu producto</p>
        </div>
      </div>

      <!-- Stepper visual (indicador de pasos) -->
      <div class="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        @for (step of steps; track step.label; let i = $index) {
          <div class="flex items-center">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <div [class]="'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' +
                (i === 0 ? 'bg-sky-600 text-white' : 'bg-[var(--bg-card)] border-2 border-[var(--border-default)] text-[var(--text-muted)]')">
                {{ i + 1 }}
              </div>
              <span [class]="'text-xs font-medium ' + (i === 0 ? 'text-sky-600' : 'text-[var(--text-muted)]')">
                {{ step.label }}
              </span>
            </div>
            @if (i < steps.length - 1) {
              <div class="w-8 h-px bg-[var(--border-default)] mx-2 flex-shrink-0"></div>
            }
          </div>
        }
      </div>

      <!-- Formulario en construcción -->
      <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-8 text-center">
        <div class="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-sky-500">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-2">Formulario de Creación</h2>
        <p class="text-[var(--text-secondary)] text-sm max-w-sm mx-auto mb-6">
          Este formulario incluye gestión de variantes, imágenes, precios por mayoreo y configuración avanzada.
          Corresponde a la <strong>Fase 7</strong> de la migración.
        </p>

        <!-- Info de pasos pendientes -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left mt-6">
          @for (step of steps; track step.label) {
            <div class="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-soft)]">
              <div class="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-sky-600">
                  <path [attr.d]="step.icon" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-[var(--text-primary)]">{{ step.label }}</p>
                <p class="text-xs text-[var(--text-muted)]">{{ step.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ProductCreateComponent {
  readonly steps = [
    { label: 'Información básica', desc: 'Nombre, descripción, categoría', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
    { label: 'Precios', desc: 'Precio base y disponibilidad', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { label: 'Variantes', desc: 'Tallas y colores disponibles', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
    { label: 'Imágenes', desc: 'Fotos del producto', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' },
    { label: 'Mayoreo', desc: 'Precios por volumen', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
  ];
}
