import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/enums/role.enum';
import { Division } from '../../core/models';
import { LoadingComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared';

@Component({
  selector: 'app-divisions',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './divisions.component.html',
  styleUrls: ['./divisions.component.scss']
})
export class DivisionsComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  showModal = signal(false);
  showConfirm = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  selectedItem = signal<Division | null>(null);
  items = signal<Division[]>([]);

  formName = '';

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number', sortable: true },
    { key: 'name', label: 'Division Name', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
  ];

  canManage = computed(() => this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN]));

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.items();
    return this.items().filter(i => i.name?.toLowerCase().includes(query));
  });

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.api.getDivisions().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Error', 'Failed to load divisions.'); }
    });
  }

  onAction(event: { type: string; row: Division }): void {
    if (event.type === 'edit' && this.canManage()) {
      this.editItem(event.row);
    } else if (event.type === 'delete' && this.canManage()) {
      this.confirmDelete(event.row);
    }
  }

  openAddForm(): void {
    this.formName = '';
    this.editMode.set(false);
    this.showModal.set(true);
  }

  editItem(item: Division): void {
    this.editMode.set(true);
    this.formName = item.name;
    this.selectedItem.set(item);
    this.showModal.set(true);
  }

  confirmDelete(item: Division): void {
    this.selectedItem.set(item);
    this.showConfirm.set(true);
  }

  onDeleteConfirmed(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.submitting.set(true);
    this.api.deleteDivision(item.id).subscribe({
      next: () => {
        this.notify.success('Deleted', `${item.name} has been deleted.`);
        this.loadItems();
        this.showConfirm.set(false);
        this.selectedItem.set(null);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to delete division.');
        this.submitting.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.formName?.trim()) {
      this.notify.warning('Validation', 'Please enter a division name.');
      return;
    }
    this.submitting.set(true);
    const payload = { name: this.formName.trim() };

    if (this.editMode() && this.selectedItem()) {
      this.api.updateDivision(this.selectedItem()!.id, payload).subscribe({
        next: () => {
          this.notify.success('Updated', `${payload.name} has been updated.`);
          this.loadItems();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to update division.');
          this.submitting.set(false);
        }
      });
    } else {
      this.api.createDivision(payload).subscribe({
        next: () => {
          this.notify.success('Created', `${payload.name} has been created.`);
          this.loadItems();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to create division.');
          this.submitting.set(false);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editMode.set(false);
    this.selectedItem.set(null);
    this.formName = '';
  }
}
