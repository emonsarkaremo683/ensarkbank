import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, StatusBadgeComponent],
  template: `
    <div class="mb-4">
      <a routerLink="/employees" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left"></i> Back to Employees
      </a>
    </div>

    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    } @else if (employee()) {
      <div class="employee-header card mb-4">
        <div class="card-body d-flex align-items-center gap-4">
          @if (employee()!.profile) {
            <img [src]="employee()!.profile" alt="Profile" class="profile-img rounded-circle" />
          } @else {
            <div class="profile-placeholder rounded-circle d-flex align-items-center justify-content-center">
              {{ getInitials(employee()!.name) }}
            </div>
          }
          <div class="flex-grow-1">
            <h3 class="mb-1">{{ employee()!.name }}</h3>
            <p class="text-muted mb-2">{{ employee()!.designation }} · {{ employee()!.branchName }}</p>
            <div class="d-flex gap-2 align-items-center">
              <app-status-badge [status]="employee()!.role" />
              <app-status-badge [status]="employee()!.active ? 'ACTIVE' : 'INACTIVE'" />
            </div>
          </div>
          <div>
            <button class="btn btn-sm" [class]="employee()!.active ? 'btn-outline-danger' : 'btn-outline-success'" (click)="toggleActive()">
              {{ employee()!.active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Personal Information</h5>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Full Name</span>
                <span class="info-value">{{ employee()!.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ employee()!.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ employee()!.phone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Gender</span>
                <span class="info-value">{{ employee()!.gender }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Designation</span>
                <span class="info-value">{{ employee()!.designation }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">{{ employee()!.dob | date:'mediumDate' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Role</span>
                <span class="info-value">
                  <app-status-badge [status]="employee()!.role" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Work Information</h5>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label">Branch</span>
                <span class="info-value">{{ employee()!.branchName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email Verified</span>
                <span class="info-value">
                  @if (employee()!.emailVerified) {
                    <span class="badge bg-success-subtle text-success">Verified</span>
                  } @else {
                    <span class="badge bg-warning-subtle text-warning">Not Verified</span>
                  }
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Active Status</span>
                <span class="info-value">
                  @if (employee()!.active) {
                    <span class="badge bg-success-subtle text-success">Active</span>
                  } @else {
                    <span class="badge bg-danger-subtle text-danger">Inactive</span>
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      @if (employee()!.addresses && employee()!.addresses!.length > 0) {
        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">Addresses</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              @for (addr of employee()!.addresses; track $index) {
                <div class="col-md-6">
                  <div class="address-card p-3 rounded">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge bg-primary-subtle text-primary">{{ addr.addressType }}</span>
                    </div>
                    <div class="mb-1"><strong>Holding No:</strong> {{ addr.holdingNo || 'N/A' }}</div>
                    <div class="mb-1"><strong>Area:</strong> {{ addr.area || 'N/A' }}</div>
                    <div class="mb-1"><strong>Police Station:</strong> {{ addr.policeStationName || 'N/A' }}</div>
                    <div><strong>Postal Code:</strong> {{ addr.postalCode || 'N/A' }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    } @else {
      <div class="card">
        <div class="card-body text-center py-5 text-muted">
          Employee not found
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-img { width: 80px; height: 80px; object-fit: cover; border: 3px solid #e2e8f0; }
    .profile-placeholder { width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; font-weight: 700; flex-shrink: 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-size: 14px; }
    .info-value { font-weight: 500; font-size: 14px; text-align: right; }
    .address-card { background: #f8fafc; border: 1px solid #e2e8f0; }
    .card-header { background: transparent; border-bottom: 1px solid #f1f5f9; }
    .card-header h5 { color: #1e293b; font-size: 16px; font-weight: 600; }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  employee = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/employee/${id}`).subscribe({
        next: (data) => { this.employee.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleActive() {
    const emp = this.employee();
    if (!emp) return;
    this.http.put<any>(`${environment.apiUrl}/employee/${emp.id}/toggle-active`, {}).subscribe({
      next: (data) => { this.employee.set(data); },
      error: () => {},
    });
  }
}
