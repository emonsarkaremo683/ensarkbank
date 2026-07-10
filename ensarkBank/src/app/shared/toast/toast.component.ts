import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../services';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                &#10003;
              }
              @case ('error') {
                &#10007;
              }
              @case ('warning') {
                &#9888;
              }
              @default {
                &#8505;
              }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close">&times;</button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease;
      transition: opacity 0.2s ease;
    }

    .toast:hover {
      opacity: 0.9;
    }

    .toast-success {
      background: #198754;
    }
    .toast-error {
      background: #dc3545;
    }
    .toast-warning {
      background: #ffc107;
      color: #212529;
    }
    .toast-info {
      background: #0d6efd;
    }

    .toast-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .toast-message {
      flex: 1;
    }
    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
    }
    .toast-close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}
