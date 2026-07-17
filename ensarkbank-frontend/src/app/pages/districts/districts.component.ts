import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/enums/role.enum';
import { Division, District } from '../../core/models';
import { LoadingComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared';

@Component({
  selector: 'app-districts',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './districts.component.html',
  styleUrls: ['./districts.component.scss']
})
export class DistrictsComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  showModal = signal(false);
  showConfirm = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  selectedItem = signal<District | null>(null);
  items = signal<District[]>([]);
  divisions = signal<Division[]>([]);

  formName = '';
  formDivisionId = 0;

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number', sortable: true },
    { key: 'name', label: 'District Name', type: 'text', sortable: true },
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
    this.loadDivisions();
  }

  loadItems(): void {
    this.loading.set(true);
    this.api.getAllDistricts().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Error', 'Failed to load districts.'); }
    });
  }

  loadDivisions(): void {
    this.api.getDivisions().subscribe({
      next: (data) => this.divisions.set(data),
      error: () => {}
    });
  }

  onAction(event: { type: string; row: District }): void {
    if (event.type === 'edit' && this.canManage()) {
      this.editItem(event.row);
    } else if (event.type === 'delete' && this.canManage()) {
      this.confirmDelete(event.row);
    }
  }

  openAddForm(): void {
    this.formName = '';
    this.formDivisionId = 0;
    this.editMode.set(false);
    this.showModal.set(true);
  }

  editItem(item: District): void {
    this.editMode.set(true);
    this.formName = item.name;
    this.formDivisionId = item.divisionId;
    this.selectedItem.set(item);
    this.showModal.set(true);
  }

  confirmDelete(item: District): void {
    this.selectedItem.set(item);
    this.showConfirm.set(true);
  }

  onDeleteConfirmed(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.submitting.set(true);
    this.api.deleteDistrict(item.id!).subscribe({
      next: () => {
        this.notify.success('Deleted', `${item.name} has been deleted.`);
        this.loadItems();
        this.showConfirm.set(false);
        this.selectedItem.set(null);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to delete district.');
        this.submitting.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.formName?.trim() || !this.formDivisionId) {
      this.notify.warning('Validation', 'Please fill in all fields.');
      return;
    }
    this.submitting.set(true);
    const payload = { name: this.formName.trim(), division: { id: this.formDivisionId } };

    if (this.editMode() && this.selectedItem()) {
      this.api.updateDistrict(this.selectedItem()!.id!, payload).subscribe({
        next: () => {
          this.notify.success('Updated', `${payload.name} has been updated.`);
          this.loadItems();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to update district.');
          this.submitting.set(false);
        }
      });
    } else {
      this.api.createDistrict(payload).subscribe({
        next: () => {
          this.notify.success('Created', `${payload.name} has been created.`);
          this.loadItems();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to create district.');
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
    this.formDivisionId = 0;
  }
}
