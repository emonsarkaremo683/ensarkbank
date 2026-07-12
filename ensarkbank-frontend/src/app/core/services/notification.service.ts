import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new Subject<Notification>();
  private counter = 0;

  get notifications() {
    return this.notifications$.asObservable();
  }

  show(type: Notification['type'], title: string, message: string) {
    this.notifications$.next({
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
}
