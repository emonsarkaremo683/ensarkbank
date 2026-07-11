import { Component, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type">
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
    }
    .toast-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px; border-radius: 10px;
      font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      animation: slideIn 0.3s ease;
      min-width: 300px;
    }
    .toast-success { background: #065F46; color: #D1FAE5; }
    .toast-error { background: #991B1B; color: #FEE2E2; }
    .toast-warning { background: #92400E; color: #FEF3C7; }
    .toast-info { background: #1E40AF; color: #DBEAFE; }
    .toast-close { background: none; border: none; color: inherit; font-size: 18px; cursor: pointer; opacity: 0.7; }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
