import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  name: string;
  path: string;
  exact: boolean;
  icon: string; // PrimeIcons class name (e.g. 'pi-home')
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  /** Estado colapsado — controlado por DashboardLayout */
  readonly isCollapsed = input(false);

  /** Callback para cerrar sidebar en mobile — viene del DashboardLayout */
  readonly closeCallback = input<() => void>(() => {});

  // ─── Items de Navegación con PrimeIcons ─────────────────────────────────────
  readonly navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      exact: true,
      icon: 'pi-home',
    },
    {
      name: 'Productos',
      path: '/dashboard/products',
      exact: false,
      icon: 'pi-box',
    },
    {
      name: 'Pedidos',
      path: '/dashboard/orders',
      exact: false,
      icon: 'pi-shopping-bag',
    },
    {
      name: 'Finanzas',
      path: '/dashboard/finances',
      exact: false,
      icon: 'pi-credit-card',
    },
    {
      name: 'Configuración',
      path: '/dashboard/settings',
      exact: false,
      icon: 'pi-cog',
    },
  ];

  // ─── Clases Computadas con Signals ───────────────────────────────────────────
  sidebarClass(): string {
    const base =
      'fixed top-14 bottom-0 left-0 z-50 bg-card text-secondary transition-all duration-300 ease-in-out flex flex-col border-r border-default lg:static lg:translate-x-0 lg:h-full';
    return this.isCollapsed()
      ? `${base} w-14 -translate-x-full lg:translate-x-0`
      : `${base} w-52 translate-x-0`;
  }

  linkClass(): string {
    const base =
      'flex rounded-md items-center font-medium transition-all duration-150 py-2 text-muted hover:bg-border-soft hover:text-primary';
    return this.isCollapsed() ? `${base} justify-center px-0` : `${base} gap-2.5 px-3.5`;
  }

  themeToggleClass(): string {
    const base =
      'flex items-center w-full py-2 rounded-lg font-medium text-muted hover:bg-border-soft hover:text-primary transition-all duration-150 cursor-pointer';
    return this.isCollapsed() ? `${base} justify-center px-0` : `${base} gap-2.5 px-3.5`;
  }

  logoutClass(): string {
    const base =
      'flex items-center w-full py-2 rounded-lg font-medium text-muted hover:bg-red-500/10 hover:text-red-500 transition-all duration-150 cursor-pointer';
    return this.isCollapsed() ? `${base} justify-center px-0` : `${base} gap-2.5 px-3.5`;
  }

  // ─── Métodos ─────────────────────────────────────────────────────────────────
  onMobileClose(): void {
    if (window.innerWidth < 1024) {
      this.closeCallback()();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
