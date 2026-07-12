import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'status' | 'badge' | 'actions';
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() searchable = true;
  @Input() paginated = true;
  @Input() pageSize = 10;
  @Input() emptyMessage = 'No data available';
  @Output() rowClick = new EventEmitter<any>();
  @Output() action = new EventEmitter<{ type: string; row: any }>();

  searchQuery = signal('');
  currentPage = signal(1);
  sortKey = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  private dataSignal = signal<any[]>([]);

  filteredData = computed(() => {
    let result = [...this.dataSignal()];
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      result = result.filter(row =>
        this.columns.some(col => {
          const value = row[col.key];
          return value !== null && value !== undefined && String(value).toLowerCase().includes(query);
        })
      );
    }

    const key = this.sortKey();
    if (key) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      result.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string') return aVal.localeCompare(bVal) * dir;
        return (aVal - bVal) * dir;
      });
    }

    return result;
  });

  paginatedData = computed(() => {
    if (!this.paginated) return this.filteredData();
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredData().length / this.pageSize) || 1;
  });

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSignal.set(this.data);
      this.currentPage.set(1);
    }
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onSort(column: TableColumn): void {
    if (column.sortable === false) return;
    if (this.sortKey() === column.key) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(column.key);
      this.sortDirection.set('asc');
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onAction(type: string, row: any, event: Event): void {
    event.stopPropagation();
    this.action.emit({ type, row });
  }

  getCellValue(row: any, column: TableColumn): string {
    const value = row[column.key];
    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      case 'date':
        return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      default:
        return String(value);
    }
  }

  getStatusClass(value: string): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'status-success',
      'SUCCESS': 'status-success',
      'APPROVED': 'status-success',
      'VERIFIED': 'status-success',
      'INACTIVE': 'status-neutral',
      'PENDING': 'status-warning',
      'UNDER_REVIEW': 'status-warning',
      'BLOCKED': 'status-danger',
      'FAILED': 'status-danger',
      'REJECTED': 'status-danger',
      'CLOSED': 'status-neutral',
      'CANCELLED': 'status-neutral',
      'FROZEN': 'status-info',
      'FREEZE': 'status-info',
    };
    return statusMap[String(value ?? '').toUpperCase()] || 'status-neutral';
  }
}
