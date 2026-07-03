import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * DashboardHomeComponent — equivalente a pages/dashboard/DashboardIndex.tsx
 *
 * Migra el dashboard placeholder con tarjetas de métricas.
 * Incluye la info del usuario autenticado via AuthService signal.
 */
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 sm:p-6 animate-fade-in">

      <!-- Bienvenida -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          Bienvenido, {{ firstName }} 👋
        </h1>
        <p class="text-[var(--text-secondary)] text-sm">
          Panel de administración de tu tienda en ChiconcuacMarket
        </p>
      </div>

      <!-- Tarjetas de métricas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">

        <!-- Ventas del mes -->
        <div class="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center">
              <i class="pi pi-dollar text-sky-600 text-lg"></i>
            </div>
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+0%</span>
          </div>
          <h3 class="text-[var(--text-secondary)] text-sm font-medium mb-1">Ventas del Mes</h3>
          <p class="text-2xl font-bold text-[var(--text-primary)]">$0.00</p>
          <p class="text-xs text-[var(--text-muted)] mt-1">vs. mes anterior</p>
        </div>

        <!-- Pedidos activos -->
        <div class="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
              <i class="pi pi-shopping-bag text-violet-600 text-lg"></i>
            </div>
            <span class="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Activos</span>
          </div>
          <h3 class="text-[var(--text-secondary)] text-sm font-medium mb-1">Pedidos Activos</h3>
          <p class="text-2xl font-bold text-[var(--text-primary)]">0</p>
          <p class="text-xs text-[var(--text-muted)] mt-1">Sin pedidos pendientes</p>
        </div>

        <!-- Productos -->
        <div class="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-default)] shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <i class="pi pi-box text-amber-600 text-lg"></i>
            </div>
            <a routerLink="/dashboard/products"
               class="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors">
              Ver todos →
            </a>
          </div>
          <h3 class="text-[var(--text-secondary)] text-sm font-medium mb-1">Productos</h3>
          <p class="text-2xl font-bold text-[var(--text-primary)]">0</p>
          <p class="text-xs text-[var(--text-muted)] mt-1">Productos publicados</p>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] p-6">
        <h2 class="text-base font-semibold text-[var(--text-primary)] mb-4">Accesos Rápidos</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a routerLink="/dashboard/products/new"
             class="flex items-center gap-3 p-4 rounded-lg border border-[var(--border-soft)] hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-all group">
            <div class="w-9 h-9 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center group-hover:bg-sky-200 dark:group-hover:bg-sky-900/50 transition-colors">
              <i class="pi pi-plus text-sky-600 text-base"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">Agregar Producto</p>
              <p class="text-xs text-[var(--text-muted)]">Publica un nuevo artículo</p>
            </div>
          </a>
          <a routerLink="/dashboard/products"
             class="flex items-center gap-3 p-4 rounded-lg border border-[var(--border-soft)] hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-all group">
            <div class="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
              <i class="pi pi-box text-violet-600 text-base"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-[var(--text-primary)]">Mis Productos</p>
              <p class="text-xs text-[var(--text-muted)]">Gestiona tu catálogo</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardHomeComponent {
  readonly authService = inject(AuthService);

  /** Primer nombre del usuario para el saludo */
  get firstName(): string {
    const name = this.authService.user()?.fullName ?? '';
    return name.split(' ')[0] || 'Vendedor';
  }
}
