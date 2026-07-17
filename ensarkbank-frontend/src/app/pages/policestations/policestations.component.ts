import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/enums/role.enum';
import { Division, District, PoliceStation } from '../../core/models';
import { LoadingComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared';

@Component({
  selector: 'app-policestations',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './policestations.component.html',
  styleUrls: ['./policestations.component.scss']
})
export class PoliceStationsComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  showModal = signal(false);
  showConfirm = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  selectedItem = signal<PoliceStation | null>(null);
  items = signal<PoliceStation[]>([]);
  divisions = signal<Division[]>([]);
  districts = signal<District[]>([]);

  formName = '';
  formDivisionId = 0;
  formDistrictId = 0;

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', type: 'number', sortable: true },
    { key: 'name', label: 'Police Station Name', type: 'text', sortable: true },
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
    this.api.getAllPoliceStations().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.notify.error('Error', 'Failed to load police stations.'); }
    });
  }

  loadDivisions(): void {
    this.api.getDivisions().subscribe({
      next: (data) => this.divisions.set(data),
      error: () => {}
    });
  }

  onDivisionChange(): void {
    this.formDistrictId = 0;
    this.districts.set([]);
    if (this.formDivisionId) {
      this.api.getDistrictsByDivision(this.formDivisionId).subscribe({
        next: (data) => this.districts.set(data),
        error: () => {}
      });
    }
  }

  onAction(event: { type: string; row: PoliceStation }): void {
    if (event.type === 'edit' && this.canManage()) {
      this.editItem(event.row);
    } else if (event.type === 'delete' && this.canManage()) {
      this.confirmDelete(event.row);
    }
  }

  openAddForm(): void {
    this.formName = '';
    this.formDivisionId = 0;
    this.formDistrictId = 0;
    this.districts.set([]);
    this.editMode.set(false);
    this.showModal.set(true);
  }

  editItem(item: PoliceStation): void {
    this.editMode.set(true);
    this.formName = item.name;
    this.formDistrictId = item.districtId;
    this.formDivisionId = 0;
    this.selectedItem.set(item);
    this.showModal.set(true);
  }

  confirmDelete(item: PoliceStation): void {
    this.selectedItem.set(item);
    this.showConfirm.set(true);
  }

  onDeleteConfirmed(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.submitting.set(true);
    this.api.deletePoliceStation(item.id!).subscribe({
      next: () => {
        this.notify.success('Deleted', `${item.name} has been deleted.`);
        this.loadItems();
        this.showConfirm.set(false);
        this.selectedItem.set(null);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to delete police station.');
        this.submitting.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.formName?.trim() || !this.formDistrictId) {
      this.notify.warning('Validation', 'Please fill in all fields.');
      return;
    }
    this.submitting.set(true);
    const payload = { name: this.formName.trim(), district: { id: this.formDistrictId } };

    if (this.editMode() && this.selectedItem()) {
      this.api.updatePoliceStation(this.selectedItem()!.id!, payload).subscribe({
        next: () => {
          this.notify.success('Updated', `${payload.name} has been updated.`);
          this.loadItems();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to update police station.');
          this.submitting.set(false);
        }
      });
    } else {
      this.api.createPoliceStation(payload).subscribe({
        next: () => {
          this.notify.success('Created', `${payload.name} has been created.`);
          this.loadItems();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to create police station.');
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
    this.formDistrictId = 0;
  }
}
