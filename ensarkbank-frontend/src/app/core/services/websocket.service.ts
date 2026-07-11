import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private eventSource: EventSource | null = null;
  private events$ = new Subject<RealTimeEvent>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private zone: NgZone) {}

  connect(endpoint: string): Observable<RealTimeEvent> {
    this.disconnect();
    
    this.zone.runOutsideAngular(() => {
      this.eventSource = new EventSource(`${environment.apiUrl}${endpoint}`);
      
      this.eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data);
            this.events$.next({
              type: event.type || 'message',
              data,
              timestamp: new Date()
            });
          } catch {
            this.events$.next({
              type: 'message',
              data: event.data,
              timestamp: new Date()
            });
          }
        });
      };

      this.eventSource.onerror = () => {
        this.reconnect();
      };
    });

    return this.events$.asObservable();
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.eventSource) {
          this.connect('/api/events');
        }
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }
}
