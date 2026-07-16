import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <div class="sidebar-overlay" [class.visible]="mobileSidebarOpen()" (click)="mobileSidebarOpen.set(false)"></div>
      <app-sidebar [collapsed]="sidebarCollapsed()" [mobileOpen]="mobileSidebarOpen()" />
      <div class="main-area">
        <app-header (sidebarToggle)="toggleSidebar()" />
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #0a1628;
    }
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      backdrop-filter: blur(2px);
    }
    .sidebar-overlay.visible {
      display: block;
    }
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 260px;
      transition: margin-left 0.3s ease;
    }
    .sidebar-collapsed .main-area {
      margin-left: 70px;
    }
    .content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    @media (max-width: 1200px) {
      .main-area {
        margin-left: 0 !important;
      }
      .content {
        padding: 16px;
      }
    }
  `]
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    if (window.innerWidth <= 1200) {
      this.mobileSidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }
}
