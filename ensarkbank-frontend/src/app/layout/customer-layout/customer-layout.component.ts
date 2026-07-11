import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <app-sidebar [collapsed]="sidebarCollapsed()" />
      <div class="main-area">
        <app-header (sidebarToggle)="sidebarCollapsed.set(!sidebarCollapsed())" />
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
    @media (max-width: 768px) {
      .main-area {
        margin-left: 0 !important;
      }
    }
  `]
})
export class CustomerLayoutComponent {
  sidebarCollapsed = signal(false);
}
