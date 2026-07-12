import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, BranchType, BranchStatus } from '../../core/enums/role.enum';
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
      address: branch.address || ''
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

    this.submitting.set(true);

    if (this.editMode() && this.selectedBranch()) {
      const payload: Partial<Branch> = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        status: status as BranchStatus,
        address: this.form.address?.trim() || ''
      };

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
      const payload: Partial<Branch> = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        type: type as BranchType,
        status: status as BranchStatus,
        address: this.form.address?.trim() || ''
      };

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
      address: ''
    };
  }
}
