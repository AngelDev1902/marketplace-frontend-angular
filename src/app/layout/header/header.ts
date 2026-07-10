import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoPrimary } from "../../shared/components/logo-primary/logo-primary";
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LogoPrimary, InputIcon, IconField, InputTextModule, FormsModule],
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
