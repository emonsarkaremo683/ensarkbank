import { Component, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="table-responsive">
      <table class="table mb-0">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th [style.width]="col.width || 'auto'">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (i of [1,2,3,4,5]; track i) {
              <tr>
                @for (col of columns(); track col.key) {
                  <td><div class="skeleton"></div></td>
                }
              </tr>
            }
          } @else if (data().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length" class="text-center py-5">
                <div class="empty-state">
                  <span class="empty-icon">📭</span>
                  <p class="empty-text">{{ emptyMessage() }}</p>
                </div>
              </td>
            </tr>
          } @else {
            @for (row of data(); track $index) {
              <tr (click)="rowClick.emit(row)" style="cursor: pointer">
                @for (col of columns(); track col.key) {
                  <td><ng-content select="[cellTemplate]"></ng-content>{{ getCellValue(row, col.key) }}</td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .skeleton {
      height: 16px;
      background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      width: 80%;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .empty-icon { font-size: 32px; }
    .empty-text { color: var(--text-muted); font-size: 14px; }
  `]
})
export class DataTableComponent<T> {
  columns = input.required<TableColumn[]>();
  data = input<T[]>([]);
  loading = input(false);
  emptyMessage = input('No data found');
  rowClick = output<any>();

  getCellValue(row: T, key: string): any {
    return (row as any)[key];
  }
}
