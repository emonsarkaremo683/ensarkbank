import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, BranchType, BranchStatus, AddressType } from '../../core/enums/role.enum';
import { Branch } from '../../core/models';
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

  form = this.getEmptyForm();

  columns: TableColumn[] = [
    { key: 'branchName', label: 'Branch Name', type: 'text', sortable: true },
    { key: 'branchCode', label: 'Code', type: 'badge', sortable: true },
    { key: 'branchType', label: 'Type', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'phone', label: 'Phone', type: 'text', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
  ];

  branchTypes = ['HEAD_OFFICE', 'REGIONAL', 'CITY', 'SUB_BRANCH', 'UDDOY'];

  canManage = computed(() => this.auth.hasRole([Role.SUPER_ADMIN]));

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
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

  filteredBranches = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.branches();
    return this.branches().filter(b =>
      b.branchName.toLowerCase().includes(query) ||
      b.branchCode.toLowerCase().includes(query) ||
      b.branchType?.toLowerCase().includes(query) ||
      b.status?.toLowerCase().includes(query)
    );
  });

  onAction(event: { type: string; row: Branch }): void {
    if (event.type === 'edit') {
      this.editBranch(event.row);
    } else if (event.type === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  openAddForm(): void {
    this.form = this.getEmptyForm();
    this.editMode.set(false);
    this.showModal.set(true);
  }

  editBranch(branch: Branch): void {
    this.editMode.set(true);
    this.form = {
      branchName: branch.branchName,
      branchCode: branch.branchCode,
      branchType: branch.branchType,
      status: branch.status,
      email: branch.email,
      phone: branch.phone,
      addressHoldingNo: branch.address?.holdingNo || '',
      addressArea: branch.address?.area || '',
      addressPostalCode: branch.address?.postalCode || '',
      addressPoliceStationId: 0
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
        this.notify.success('Deleted', `${branch.branchName} has been deleted.`);
        this.loadBranches();
        this.showConfirm.set(false);
        this.selectedBranch.set(null);
        this.submitting.set(false);
      },
      error: () => {
        this.notify.error('Error', 'Failed to delete branch.');
        this.submitting.set(false);
      }
    });
  }

  toggleStatus(branch: Branch): void {
    const newStatus = branch.status === BranchStatus.ACTIVE ? BranchStatus.CLOSED : BranchStatus.ACTIVE;
    this.api.updateBranch(branch.id, { status: newStatus }).subscribe({
      next: () => {
        this.notify.success('Updated', `${branch.branchName} is now ${newStatus}.`);
        this.loadBranches();
      },
      error: () => {
        this.notify.error('Error', 'Failed to update branch status.');
      }
    });
  }

  onSubmit(): void {
    if (!this.form.branchName || !this.form.branchCode || !this.form.branchType) {
      this.notify.warning('Validation', 'Please fill in all required fields.');
      return;
    }

    this.submitting.set(true);

    const payload: Partial<Branch> = {
      branchName: this.form.branchName,
      branchCode: this.form.branchCode,
      branchType: this.form.branchType as BranchType,
      status: (this.form.status as BranchStatus) || BranchStatus.ACTIVE,
      email: this.form.email,
      phone: this.form.phone
    };

    if (this.form.addressArea || this.form.addressHoldingNo) {
      payload.address = {
        id: 0,
        holdingNo: this.form.addressHoldingNo || '',
        area: this.form.addressArea || '',
        postalCode: this.form.addressPostalCode || '',
        addressType: AddressType.PRESENT,
        policeStationName: ''
      };
    }

    if (this.editMode() && this.selectedBranch()) {
      this.api.updateBranch(this.selectedBranch()!.id, payload).subscribe({
        next: () => {
          this.notify.success('Updated', `${payload.branchName} has been updated.`);
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
      this.api.createBranch(payload).subscribe({
        next: () => {
          this.notify.success('Created', `${payload.branchName} has been created.`);
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
      branchName: '',
      branchCode: '',
      branchType: '',
      status: 'ACTIVE',
      email: '',
      phone: '',
      addressHoldingNo: '',
      addressArea: '',
      addressPostalCode: '',
      addressPoliceStationId: 0
    };
  }
}
