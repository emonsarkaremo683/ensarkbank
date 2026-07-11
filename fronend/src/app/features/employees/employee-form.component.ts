import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mb-4">
      <a routerLink="/employees" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left"></i> Back to Employees
      </a>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <h4 class="mb-0">Create New Employee</h4>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()" #form="ngForm">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header"><h5 class="mb-0">Personal Information</h5></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="employee.name" name="name" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" [(ngModel)]="employee.email" name="email" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Password *</label>
                  <input type="password" class="form-control" [(ngModel)]="employee.password" name="password" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Phone *</label>
                  <input type="text" class="form-control" [(ngModel)]="employee.phone" name="phone" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Gender *</label>
                  <select class="form-select" [(ngModel)]="employee.gender" name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Designation *</label>
                  <select class="form-select" [(ngModel)]="employee.designation" name="designation" required>
                    <option value="">Select Designation</option>
                    @for (d of designations; track d) {
                      <option [value]="d">{{ d.replace('_', ' ') }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Date of Birth *</label>
                  <input type="date" class="form-control" [(ngModel)]="employee.dob" name="dob" required />
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header"><h5 class="mb-0">Work Information</h5></div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Role *</label>
                  <select class="form-select" [(ngModel)]="employee.role" name="role" required>
                    <option value="">Select Role</option>
                    @for (r of roles; track r) {
                      <option [value]="r">{{ r.replace('_', ' ') }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Branch *</label>
                  <select class="form-select" [(ngModel)]="employee.branchId" name="branchId" required>
                    <option value="">Select Branch</option>
                    @for (b of branches(); track b.id) {
                      <option [value]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Addresses</h5>
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="addAddress()">+ Add Address</button>
            </div>
            <div class="card-body">
              @for (addr of employee.addresses; track $index; let i = $index) {
                <div class="address-entry p-3 mb-3 rounded">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Address {{ i + 1 }}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeAddress(i)">Remove</button>
                  </div>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label">Address Type *</label>
                      <select class="form-select" [(ngModel)]="addr.addressType" [name]="'addrType' + i" required>
                        <option value="PERMANENT">Permanent</option>
                        <option value="PRESENT">Present</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Holding No</label>
                      <input type="text" class="form-control" [(ngModel)]="addr.holdingNo" [name]="'holdingNo' + i" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Area</label>
                      <input type="text" class="form-control" [(ngModel)]="addr.area" [name]="'area' + i" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Postal Code</label>
                      <input type="text" class="form-control" [(ngModel)]="addr.postalCode" [name]="'postalCode' + i" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Police Station *</label>
                      <select class="form-select" [(ngModel)]="addr.policeStationId" [name]="'ps' + i" required>
                        <option value="">Select Police Station</option>
                        @for (ps of policeStations(); track ps.id) {
                          <option [value]="ps.id">{{ ps.name }}</option>
                        }
                      </select>
                    </div>
                  </div>
                </div>
              }
              @if (employee.addresses.length === 0) {
                <p class="text-muted text-center mb-0">No addresses added</p>
              }
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-header"><h5 class="mb-0">Profile Photo</h5></div>
            <div class="card-body text-center">
              @if (profilePreview()) {
                <img [src]="profilePreview()" alt="Profile Preview" class="profile-preview rounded-circle mb-3" />
              } @else {
                <div class="profile-placeholder rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                  <i class="bi bi-camera" style="font-size: 24px;"></i>
                </div>
              }
              <input type="file" class="form-control" accept="image/*" (change)="onFileSelect($event)" />
            </div>
          </div>

          <div class="card">
            <div class="card-body d-flex gap-2">
              <button type="submit" class="btn btn-primary flex-grow-1" [disabled]="form.invalid || submitting()">
                @if (submitting()) {
                  <span class="spinner-border spinner-border-sm"></span> Creating...
                } @else {
                  Create Employee
                }
              </button>
              <a routerLink="/employees" class="btn btn-outline-secondary">Cancel</a>
            </div>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .profile-preview { width: 120px; height: 120px; object-fit: cover; border: 3px solid #e2e8f0; }
    .profile-placeholder { width: 120px; height: 120px; background: #f1f5f9; color: #94a3b8; }
    .address-entry { background: #f8fafc; border: 1px solid #e2e8f0; }
    .address-entry h6 { color: #475569; font-weight: 600; }
    .card-header { background: transparent; border-bottom: 1px solid #f1f5f9; }
    .card-header h5 { color: #1e293b; font-size: 16px; font-weight: 600; }
    .form-label { font-size: 13px; font-weight: 500; color: #475569; }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  employee = {
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    designation: '',
    dob: '',
    role: '',
    branchId: '',
    addresses: [] as any[],
  };

  profileFile: File | null = null;
  profilePreview = signal<string | null>(null);
  branches = signal<any[]>([]);
  policeStations = signal<any[]>([]);
  submitting = signal(false);

  designations = [
    'CHIEF_EXECUTIVE_OFFICER', 'MANAGING_DIRECTOR', 'DEPUTY_MANAGING_DIRECTOR',
    'GENERAL_MANAGER', 'DEPUTY_GENERAL_MANAGER', 'ASSISTANT_GENERAL_MANAGER',
    'BRANCH_MANAGER', 'ASSISTANT_BRANCH_MANAGER', 'OPERATIONS_MANAGER',
    'TELLER', 'CASH_OFFICER', 'CUSTOMER_SERVICE_OFFICER', 'RELATIONSHIP_MANAGER',
    'LOAN_OFFICER', 'ACCOUNTS_OFFICER', 'COMPLIANCE_OFFICER', 'AUDIT_OFFICER',
    'SYSTEM_ADMINISTRATOR', 'SOFTWARE_ENGINEER', 'NETWORK_ENGINEER', 'DATABASE_ADMINISTRATOR',
    'HR_OFFICER', 'ADMIN_OFFICER', 'FINANCE_OFFICER', 'TREASURY_OFFICER',
    'SECURITY_OFFICER', 'OFFICE_ASSISTANT', 'INTERN',
  ];

  roles = ['ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'CUSTOMER_SERVICE', 'LOAN_OFFICER', 'ATM_MANAGER', 'AUDITOR'];

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
      error: () => {},
    });
    this.http.get<any[]>(`${environment.apiUrl}/policestation/`).subscribe({
      next: (data) => this.policeStations.set(data),
      error: () => {},
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.profileFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.profilePreview.set(reader.result as string);
      reader.readAsDataURL(this.profileFile);
    }
  }

  addAddress() {
    this.employee.addresses.push({
      holdingNo: '',
      area: '',
      postalCode: '',
      addressType: 'PERMANENT',
      policeStationId: '',
    });
  }

  removeAddress(index: number) {
    this.employee.addresses.splice(index, 1);
  }

  onSubmit() {
    if (this.submitting()) return;
    this.submitting.set(true);

    const requestPayload = {
      name: this.employee.name,
      email: this.employee.email,
      password: this.employee.password,
      phone: this.employee.phone,
      gender: this.employee.gender,
      designation: this.employee.designation,
      dob: this.employee.dob,
      role: this.employee.role,
      branchId: this.employee.branchId ? Number(this.employee.branchId) : null,
      addresses: this.employee.addresses.map(a => ({
        holdingNo: a.holdingNo,
        area: a.area,
        postalCode: a.postalCode,
        addressType: a.addressType,
        policeStation: { id: Number(a.policeStationId) },
      })),
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(requestPayload));
    if (this.profileFile) {
      formData.append('profile', this.profileFile);
    }

    this.http.post<any>(`${environment.apiUrl}/employee/`, formData).subscribe({
      next: () => { this.router.navigate(['/employees']); },
      error: () => { this.submitting.set(false); },
    });
  }
}
