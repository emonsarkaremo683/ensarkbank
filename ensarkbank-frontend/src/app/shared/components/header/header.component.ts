import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() notificationCount = 0;
  @Output() sidebarToggle = new EventEmitter<void>();

  private authService = inject(AuthService);

  showUserMenu = signal(false);
  showNotifications = signal(false);
  searchQuery = signal('');

  user = this.authService.currentUser;

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
  }

  closeDropdowns(): void {
    this.showUserMenu.set(false);
    this.showNotifications.set(false);
  }

  onHeaderClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-section') && !target.closest('.notification-btn')) {
      this.closeDropdowns();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
