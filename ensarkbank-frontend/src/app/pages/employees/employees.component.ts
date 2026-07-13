import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role, Designation, Gender, DesignationMap, AddressType } from '../../core/enums/role.enum';
import {
  EmployeeResponse, EmployeeRequest, Branch, AddressRequest
} from '../../core/models';
import { LoadingComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent } from '../../shared';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DataTableComponent, ConfirmDialogComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  showModal = signal(false);
  showConfirm = signal(false);
  editMode = signal(false);
  searchQuery = signal('');
  selectedEmployee = signal<EmployeeResponse | null>(null);
  employees = signal<EmployeeResponse[]>([]);
  branches = signal<Branch[]>([]);
  divisions = signal<any[]>([]);
  districts = signal<any[]>([]);
  policeStations = signal<any[]>([]);
  selectedProfileFile = signal<File | null>(null);

  form = this.getEmptyForm();

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'phone', label: 'Phone', type: 'text', sortable: true },
    { key: 'designation', label: 'Designation', type: 'badge', sortable: true },
    { key: 'branchName', label: 'Branch', type: 'text', sortable: true },
    { key: 'role', label: 'Role', type: 'status', sortable: true },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
  ];

  designationOptions = Object.values(Designation);
  genderOptions = Object.values(Gender);
  roleOptions = Object.values(Role).filter(r => r !== Role.CUSTOMER);

  canManage = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN])
  );

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    if (!this.canManage()) {
      this.notify.warning('Access Denied', 'You do not have permission to manage employees.');
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Error', 'Failed to load employees.');
      }
    });

    this.api.getBranches().subscribe({
      next: (data) => this.branches.set(data),
      error: () => {}
    });

    this.api.getDivisions().subscribe({
      next: (data) => this.divisions.set(data),
      error: () => {}
    });
  }

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.employees();
    return this.employees().filter(e =>
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.phone?.toLowerCase().includes(query) ||
      e.designation?.toLowerCase().includes(query) ||
      e.role?.toLowerCase().includes(query) ||
      e.branchName?.toLowerCase().includes(query)
    );
  });

  onAction(event: { type: string; row: EmployeeResponse }): void {
    if (event.type === 'edit') {
      this.editEmployee(event.row);
    } else if (event.type === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  openAddForm(): void {
    this.form = this.getEmptyForm();
    this.editMode.set(false);
    this.selectedProfileFile.set(null);
    this.showModal.set(true);
  }

  editEmployee(employee: EmployeeResponse): void {
    this.editMode.set(true);
    this.form = {
      email: employee.email,
      password: '',
      name: employee.name,
      gender: employee.gender as any,
      phone: employee.phone,
      designation: employee.designation,
      branchId: 0,
      role: employee.role,
      dateOfBirth: employee.dob?.split('T')[0] || '',
      addresses: employee.addresses?.map(a => ({
        holdingNo: a.holdingNo || '',
        area: a.area || '',
        postalCode: a.postalCode || '',
        addressType: a.addressType || AddressType.PERMANENT,
        policeStation: { id: 0 }
      })) || []
    };
    this.selectedEmployee.set(employee);
    this.showModal.set(true);
  }

  confirmDelete(employee: EmployeeResponse): void {
    this.selectedEmployee.set(employee);
    this.showConfirm.set(true);
  }

  onDeleteConfirmed(): void {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.submitting.set(true);
    this.api.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.notify.success('Deleted', `${employee.name} has been removed.`);
        this.loadData();
        this.showConfirm.set(false);
        this.selectedEmployee.set(null);
        this.submitting.set(false);
      },
      error: () => {
        this.notify.error('Error', 'Failed to delete employee.');
        this.submitting.set(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.form.name || !this.form.email || !this.form.phone || !this.form.designation || !this.form.branchId) {
      this.notify.warning('Validation', 'Please fill in all required fields.');
      return;
    }

    if (!this.editMode() && !this.form.password) {
      this.notify.warning('Validation', 'Password is required for new employees.');
      return;
    }

    this.submitting.set(true);

    const dto: EmployeeRequest = {
      email: this.form.email,
      password: this.form.password || undefined,
      name: this.form.name,
      gender: this.form.gender,
      phone: this.form.phone,
      designation: this.form.designation as Designation,
      branchId: this.form.branchId,
      role: this.form.role ? (this.form.role as Role) : undefined,
      dob: this.form.dateOfBirth,
      addresses: this.form.addresses.length > 0 ? this.form.addresses : []
    };

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (this.selectedProfileFile()) {
      formData.append('profile', this.selectedProfileFile()!);
    }

    if (this.editMode() && this.selectedEmployee()) {
      this.api.updateEmployee(this.selectedEmployee()!.id, formData).subscribe({
        next: () => {
          this.notify.success('Updated', `${dto.name} has been updated.`);
          this.loadData();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to update employee.');
          this.submitting.set(false);
        }
      });
    } else {
      this.api.createEmployee(formData).subscribe({
        next: () => {
          this.notify.success('Created', `${dto.name} has been created.`);
          this.loadData();
          this.closeModal();
          this.submitting.set(false);
        },
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to create employee.');
          this.submitting.set(false);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editMode.set(false);
    this.selectedEmployee.set(null);
    this.selectedProfileFile.set(null);
    this.form = this.getEmptyForm();
  }

  addAddress(): void {
    this.form.addresses.push({
      holdingNo: '',
      area: '',
      postalCode: '',
      addressType: AddressType.PERMANENT,
      policeStation: { id: 0 }
    });
  }

  removeAddress(index: number): void {
    this.form.addresses.splice(index, 1);
  }

  onProfileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProfileFile.set(input.files[0]);
    }
  }

  onDesignationChange(): void {
    const info = DesignationMap[this.form.designation as Designation];
    if (info) {
      this.form.role = info.defaultRole;
    }
  }

  private getEmptyForm() {
    return {
      email: '',
      password: '',
      name: '',
      gender: Gender.MALE,
      phone: '',
      designation: '',
      branchId: 0,
      role: '',
      dateOfBirth: '',
      addresses: [] as AddressRequest[]
    };
  }
}
