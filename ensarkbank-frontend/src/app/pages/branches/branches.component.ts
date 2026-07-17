import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, BranchType, BranchStatus } from '../../core/enums/role.enum';
import { Branch, Division, District, PoliceStation } from '../../core/models';
import { LoadingComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  showModal = signal(false);
  showConfirm = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  selectedBranch = signal<Branch | null>(null);
  branches = signal<Branch[]>([]);

  divisions = signal<Division[]>([]);
  districts = signal<District[]>([]);
  policeStations = signal<PoliceStation[]>([]);
  parentBranches = signal<Branch[]>([]);

  form = this.getEmptyForm();

  columns: TableColumn[] = [
    { key: 'name', label: 'Branch Name', type: 'text', sortable: true },
    { key: 'branchCode', label: 'Code', type: 'badge', sortable: true },
    { key: 'type', label: 'Type', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'phoneNumber', label: 'Phone', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
  ];

  branchTypes = Object.values(BranchType);

  canManage = computed(() => this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN]));
  canEdit = computed(() => this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER]));

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    this.loadDivisions();
  }

  loadBranches(): void {
    this.loading.set(true);
    this.api.getBranches().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Error', 'Failed to load branches.');
      }
    });
  }

  loadDivisions(): void {
    this.api.getDivisions().subscribe({
      next: (data) => this.divisions.set(data),
      error: () => {}
    });
  }

  onDivisionChange(): void {
    this.form.districtId = 0;
    this.form.policeStationId = 0;
    this.districts.set([]);
    this.policeStations.set([]);
    if (this.form.divisionId) {
      this.api.getDistrictsByDivision(this.form.divisionId).subscribe({
        next: (data) => this.districts.set(data),
        error: () => {}
      });
    }
  }

  onDistrictChange(): void {
    this.form.policeStationId = 0;
    this.policeStations.set([]);
    if (this.form.districtId) {
      this.api.getPoliceStationsByDistrict(this.form.districtId).subscribe({
        next: (data) => this.policeStations.set(data),
        error: () => {}
      });
    }
  }

  onTypeChange(): void {
    this.form.parentBranchId = 0;
    this.parentBranches.set([]);
    if (this.form.type === BranchType.AGENT_BANK) {
      this.api.getBranches().subscribe({
        next: (data) => {
          this.parentBranches.set(data.filter(b => b.type !== BranchType.AGENT_BANK));
        },
        error: () => {}
      });
    }
  }

  filteredBranches = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.branches();
    return this.branches().filter(b =>
      b.name?.toLowerCase().includes(query) ||
      b.branchCode?.toLowerCase().includes(query) ||
      b.type?.toLowerCase().includes(query) ||
      b.status?.toLowerCase().includes(query) ||
      b.email?.toLowerCase().includes(query) ||
      b.phoneNumber?.toLowerCase().includes(query)
    );
  });

  onAction(event: { type: string; row: Branch }): void {
    if (event.type === 'edit' && this.canEdit()) {
      this.editBranch(event.row);
    } else if (event.type === 'delete' && this.canManage()) {
      this.confirmDelete(event.row);
    }
  }

  openAddForm(): void {
    this.form = this.getEmptyForm();
    this.editMode.set(false);
    this.districts.set([]);
    this.policeStations.set([]);
    this.parentBranches.set([]);
    this.showModal.set(true);
  }

  editBranch(branch: Branch): void {
    this.editMode.set(true);
    this.form = {
      name: branch.name || '',
      branchCode: branch.branchCode || '',
      type: branch.type || '',
      status: branch.status || BranchStatus.ACTIVE,
      email: branch.email || '',
      phoneNumber: branch.phoneNumber || '',
      address: branch.address || '',
      parentBranchId: branch.parentBranch?.id || 0,
      policeStationId: branch.policeStation?.id || 0,
      divisionId: 0,
      districtId: 0
    };
    this.selectedBranch.set(branch);
    this.showModal.set(true);
  }

  confirmDelete(branch: Branch): void {
    this.selectedBranch.set(branch);
    this.showConfirm.set(true);
  }

  onDeleteConfirmed(): void {
    const branch = this.selectedBranch();
    if (!branch) return;
    this.submitting.set(true);
    this.api.deleteBranch(branch.id).subscribe({
      next: () => {
        this.notify.success('Deleted', `${branch.name} has been deleted.`);
        this.loadBranches();
        this.showConfirm.set(false);
        this.selectedBranch.set(null);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to delete branch.');
        this.submitting.set(false);
      }
    });
  }

  onSubmit(): void {
    const { name, email, phoneNumber, type, status } = this.form;

    if (!name?.trim() || !email?.trim() || !phoneNumber?.trim() || !type || !status) {
      this.notify.warning('Validation', 'Please fill in all required fields.');
      return;
    }

    if (type === BranchType.AGENT_BANK && !this.form.parentBranchId) {
      this.notify.warning('Validation', 'Parent branch is required for agent banks.');
      return;
    }

    this.submitting.set(true);

    if (this.editMode() && this.selectedBranch()) {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        status: status as BranchStatus,
        address: this.form.address?.trim() || ''
      };
      if (this.form.policeStationId) {
        payload.policeStation = { id: this.form.policeStationId };
      }

      this.api.updateBranch(this.selectedBranch()!.id, payload).subscribe({
        next: () => {
          this.notify.success('Updated', `${payload.name} has been updated.`);
          this.loadBranches();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to update branch.');
          this.submitting.set(false);
        }
      });
    } else {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        type: type as BranchType,
        status: status as BranchStatus,
        address: this.form.address?.trim() || ''
      };
      if (this.form.parentBranchId) {
        payload.parentBranch = { id: this.form.parentBranchId };
      }
      if (this.form.policeStationId) {
        payload.policeStation = { id: this.form.policeStationId };
      }

      this.api.createBranch(payload).subscribe({
        next: () => {
          this.notify.success('Created', `${payload.name} has been created.`);
          this.loadBranches();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to create branch.');
          this.submitting.set(false);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editMode.set(false);
    this.selectedBranch.set(null);
    this.form = this.getEmptyForm();
  }

  private getEmptyForm() {
    return {
      name: '',
      branchCode: '',
      type: '',
      status: BranchStatus.ACTIVE,
      email: '',
      phoneNumber: '',
      address: '',
      parentBranchId: 0,
      divisionId: 0,
      districtId: 0,
      policeStationId: 0
    };
  }
}
