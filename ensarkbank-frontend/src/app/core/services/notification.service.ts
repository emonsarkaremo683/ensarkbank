import { Injectable, inject, signal, computed, OnDestroy, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { WebSocketService, AppNotification } from './websocket.service';
import { environment } from '../../../environments/environment';

export interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private toastNotifications$ = new Subject<ToastNotification>();
  private counter = 0;
  private wsSubscription: Subscription | null = null;

  private http = inject(HttpClient);
  private ws = inject(WebSocketService);
  private zone = inject(NgZone);

  notifications = signal<AppNotification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private readonly API_URL = `${environment.apiUrl}/api/notifications`;

  get toasts() {
    return this.toastNotifications$.asObservable();
  }

  init(): void {
    this.wsSubscription = this.ws.notifications$.subscribe(notification => {
      this.zone.run(() => {
        const existing = this.notifications();
        const duplicate = existing.some(n => n.id === notification.id);
        if (duplicate) {
          return;
        }
        this.notifications.update(list => [notification, ...list]);
        this.toastNotifications$.next({
          id: notification.id || ++this.counter,
          type: this.mapNotificationType(notification.type),
          title: notification.title,
          message: notification.message,
          timestamp: new Date()
        });
      });
    });
  }

  loadNotifications(): void {
    this.http.get<AppNotification[]>(this.API_URL).subscribe({
      next: (data) => {
        const current = this.notifications();
        const readIds = new Set(current.filter(n => n.isRead).map(n => n.id));
        const merged = data.map(n => readIds.has(n.id) ? { ...n, isRead: true } : n);
        this.notifications.set(merged);
      },
      error: () => {}
    });
  }

  loadUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.API_URL}/unread-count`).subscribe({
      next: (data) => {
        const current = this.notifications();
        const unread = current.filter(n => !n.isRead).length;
        if (data.count !== unread) {
          this.loadNotifications();
        }
      },
      error: () => {}
    });
  }

  markAsRead(id: number): void {
    this.http.put(`${this.API_URL}/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    });
  }

  markAllAsRead(): void {
    this.http.put(`${this.API_URL}/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, isRead: true }))
        );
      }
    });
  }

  show(type: ToastNotification['type'], title: string, message: string) {
    this.toastNotifications$.next({
      id: ++this.counter,
      type,
      title,
      message,
      timestamp: new Date()
    });
  }

  success(title: string, message: string) { this.show('success', title, message); }
  error(title: string, message: string) { this.show('error', title, message); }
  warning(title: string, message: string) { this.show('warning', title, message); }
  info(title: string, message: string) { this.show('info', title, message); }

  private mapNotificationType(type: string): ToastNotification['type'] {
    if (type.includes('SUCCESS') || type.includes('DEPOSIT')) return 'success';
    if (type.includes('FAILED') || type.includes('REJECTED')) return 'error';
    if (type.includes('PENDING') || type.includes('WARNING')) return 'warning';
    return 'info';
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }
}
