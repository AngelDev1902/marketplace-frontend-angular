import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
})
export class HeaderComponent {
  readonly authService = inject(AuthService);

  /** Recibido del DashboardLayout */
  readonly isSidebarCollapsed = input(false);
  readonly onToggleSidebar = input<() => void>(() => {});

  toggleSidebar(): void {
    this.onToggleSidebar()();
  }
}
