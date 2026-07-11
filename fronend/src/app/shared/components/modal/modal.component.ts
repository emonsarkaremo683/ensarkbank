import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="modal-backdrop" (click)="close.emit()"></div>
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title() }}</h5>
            <button class="btn-close" (click)="close.emit()"></button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (showFooter()) {
            <div class="modal-footer">
              <button class="btn btn-outline-secondary" (click)="close.emit()">Cancel</button>
              <button class="btn" [class]="confirmClass()" (click)="confirm.emit()">{{ confirmText() }}</button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      z-index: 1040; backdrop-filter: blur(2px);
    }
    .modal-dialog {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      z-index: 1050; width: 90%; max-width: 500px;
    }
    .modal-content {
      background: var(--surface); border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border);
    }
    .modal-title { font-family: var(--font-heading); font-weight: 700; font-size: 18px; }
    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted); }
    .modal-body { padding: 24px; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 12px;
      padding: 16px 24px; border-top: 1px solid var(--border);
    }
    .btn { border-radius: 8px; padding: 8px 20px; font-weight: 600; font-size: 13px; }
  `]
})
export class ModalComponent {
  open = input(false);
  title = input('');
  confirmText = input('Confirm');
  confirmClass = input('btn-danger');
  showFooter = input(true);
  close = output();
  confirm = output();
}
