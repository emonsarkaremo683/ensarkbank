import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="badgeClass()">{{ label() }}</span>
  `,
  styles: [`
    .badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .bg-success-subtle { background: #D1FAE5 !important; color: #065F46 !important; }
    .bg-danger-subtle { background: #FEE2E2 !important; color: #991B1B !important; }
    .bg-warning-subtle { background: #FEF3C7 !important; color: #92400E !important; }
    .bg-secondary-subtle { background: #F1F5F9 !important; color: #475569 !important; }
    .bg-primary-subtle { background: #DBEAFE !important; color: #1E40AF !important; }
  `]
})
export class StatusBadgeComponent {
  status = input.required<string>();

  badgeClass(): string {
    const map: Record<string, string> = {
      ACTIVE: 'bg-success-subtle',
      VERIFIED: 'bg-success-subtle',
      PAID: 'bg-success-subtle',
      SUCCESS: 'bg-success-subtle',
      APPROVED: 'bg-success-subtle',
      DISBURSED: 'bg-success-subtle',
      CLOSED: 'bg-secondary-subtle',
      CANCELLED: 'bg-secondary-subtle',
      REVERSED: 'bg-secondary-subtle',
      EXPIRED: 'bg-secondary-subtle',
      DISABLED: 'bg-secondary-subtle',
      OFFLINE: 'bg-secondary-subtle',
      PENDING: 'bg-warning-subtle',
      UNDER_REVIEW: 'bg-warning-subtle',
      LATE: 'bg-warning-subtle',
      MAINTENANCE: 'bg-warning-subtle',
      BLOCKED: 'bg-danger-subtle',
      REJECTED: 'bg-danger-subtle',
      FAILED: 'bg-danger-subtle',
      DEFAULTED: 'bg-danger-subtle',
      OUT_OF_SERVICE: 'bg-danger-subtle',
      MISSED: 'bg-danger-subtle',
      INACTIVE: 'bg-secondary-subtle',
      FREEZE: 'bg-primary-subtle',
    };
    return map[this.status()] || 'bg-secondary-subtle';
  }

  label(): string {
    return this.status().replace(/_/g, ' ');
  }
}
