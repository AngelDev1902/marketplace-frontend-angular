import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayoutComponent {
  @ViewChild('sidebar') sidebarRef!: SidebarComponent;

  /** Estado colapsado del sidebar — signal reactivo (equivalente a useState) */
  readonly isSidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  collapseSidebar(): void {
    this.isSidebarCollapsed.set(true);
  }
}
