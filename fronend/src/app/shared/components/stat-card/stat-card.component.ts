import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  template: `
    <div class="stat-card">
      <div class="stat-icon" [style.background]="iconBg()">
        <span [innerHTML]="icon()"></span>
      </div>
      <div class="stat-content">
        <span class="stat-label">{{ label() }}</span>
        <span class="stat-value">{{ value() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: box-shadow 0.2s;
    }
    .stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    .stat-content { display: flex; flex-direction: column; gap: 2px; }
    .stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .stat-value { font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: var(--text-primary); }
  `]
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  icon = input<string>('');
  iconBg = input<string>('rgba(37, 99, 235, 0.1)');
}
