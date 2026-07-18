import { Component, Output, EventEmitter, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService, AppNotification } from '../../../core/services/websocket.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidebarToggle = new EventEmitter<void>();

  private authService = inject(AuthService);
  private wsService = inject(WebSocketService);
  private notificationService = inject(NotificationService);
  private subscriptions: Subscription[] = [];

  showUserMenu = signal(false);
  showNotifications = signal(false);
  searchQuery = signal('');
  toastNotification = signal<{ type: string; title: string; message: string } | null>(null);
  showToast = signal(false);

  user = this.authService.currentUser;
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.wsService.connect();
    this.notificationService.init();
    this.notificationService.loadNotifications();

    const toastSub = this.notificationService.toasts.subscribe(toast => {
      this.toastNotification.set(toast);
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 5000);
    });
    this.subscriptions.push(toastSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.wsService.disconnect();
  }

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
    if (!this.showNotifications()) {
      this.notificationService.markAllAsRead();
    }
  }

  closeDropdowns(): void {
    this.showUserMenu.set(false);
    this.showNotifications.set(false);
  }

  onHeaderClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-section') && !target.closest('.notification-btn') && !target.closest('.notifications-dropdown')) {
      this.closeDropdowns();
    }
  }

  onNotificationClick(notification: AppNotification): void {
    this.notificationService.markAsRead(notification.id);
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }

  dismissToast(): void {
    this.showToast.set(false);
  }

  logout(): void {
    this.wsService.disconnect();
    this.authService.logout();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  getNotificationIcon(type: string): string {
    if (type.includes('DEPOSIT') || type.includes('SUCCESS')) return '&#9989;';
    if (type.includes('WITHDRAW') || type.includes('TRANSFER')) return '&#128176;';
    if (type.includes('FAILED') || type.includes('REJECTED')) return '&#10060;';
    if (type.includes('LOAN')) return '&#127974;';
    return '&#128276;';
  }
}
