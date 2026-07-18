import { Injectable, OnDestroy, inject, NgZone } from '@angular/core';
import { Client, IMessage, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private notificationsSubject = new Subject<AppNotification>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private subscription: any = null;
  private reconnectTimer: any = null;

  notifications$ = this.notificationsSubject.asObservable();
  connected$ = this.connectionStatus.asObservable();

  private auth = inject(AuthService);
  private zone = inject(NgZone);

  connect(): void {
    const token = this.auth.getDecryptedToken();
    if (!token) {
      return;
    }

    if (this.client && this.client.active) {
      return;
    }

    const wsUrlWithToken = `${environment.wsUrl}?token=${encodeURIComponent(token)}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrlWithToken),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str: string) => {
        if (!str.includes('Heartbeat') && !str.includes('Received') && !str.includes('>>>')) {
          
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.zone.run(() => {
          this.connectionStatus.next(true);
        });
        this.subscribeToNotifications();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.zone.run(() => {
          this.connectionStatus.next(false);
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame.headers['message']);
        this.zone.run(() => {
          this.connectionStatus.next(false);
        });
      }
    });

    this.client.activate();
  }

  private subscribeToNotifications(): void {
    if (!this.client || !this.client.connected) return;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.client.subscribe(
      '/user/queue/notifications',
      (message: IMessage) => {
        try {
          const notification: AppNotification = JSON.parse(message.body);
          this.zone.run(() => {
            this.notificationsSubject.next(notification);
          });
        } catch (e) {
          console.error('Failed to parse notification:', e);
        }
      }
    );

    this.client.subscribe(
      '/topic/notifications',
      (message: IMessage) => {
        try {
          const notification: AppNotification = JSON.parse(message.body);
          this.zone.run(() => {
            this.notificationsSubject.next(notification);
          });
        } catch (e) {
          console.error('Failed to parse broadcast notification:', e);
        }
      }
    );
  }

  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connectionStatus.next(false);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
