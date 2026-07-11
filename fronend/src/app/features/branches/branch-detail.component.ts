import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  template: `
    <div class="mb-4">
      <a routerLink="/branches" class="btn btn-outline-secondary btn-sm mb-3">
        <i class="bi bi-arrow-left me-1"></i> Back to Branches
      </a>

      @if (loading()) {
        <div class="card"><div class="card-body"><div class="skeleton-heading"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div></div></div>
      } @else if (branch()) {
        <div class="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 class="mb-1">{{ branch()!.name }}</h2>
            <div class="d-flex align-items-center gap-3">
              <span class="text-muted font-mono">{{ branch()!.branchCode }}</span>
              <app-status-badge [status]="branch()!.status" />
            </div>
          </div>
          <div class="d-flex gap-2">
            <a [routerLink]="['/branches/edit', branch()!.id]" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-pencil me-1"></i> Edit
            </a>
            <button class="btn btn-outline-warning btn-sm" (click)="toggleStatus()">
              <i class="bi bi-arrow-repeat me-1"></i> Toggle Status
            </button>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card mb-4">
              <div class="card-header"><h6 class="mb-0">Branch Information</h6></div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6"><label class="form-label text-muted small">Name</label><p class="mb-0 fw-semibold">{{ branch()!.name }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Branch Code</label><p class="mb-0 font-mono">{{ branch()!.branchCode }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Address</label><p class="mb-0">{{ branch()!.address }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Routing Number</label><p class="mb-0 font-mono">{{ branch()!.routingNumber }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Email</label><p class="mb-0">{{ branch()!.email }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Phone</label><p class="mb-0">{{ branch()!.phoneNumber }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Type</label><p class="mb-0">{{ branch()!.type }}</p></div>
                  <div class="col-md-6"><label class="form-label text-muted small">Status</label><p class="mb-0"><app-status-badge [status]="branch()!.status" /></p></div>
                </div>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header"><h6 class="mb-0">Location</h6></div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-4"><label class="form-label text-muted small">Police Station</label><p class="mb-0">{{ branch()!.policeStation?.name || '—' }}</p></div>
                  <div class="col-md-4"><label class="form-label text-muted small">District</label><p class="mb-0">{{ branch()!.policeStation?.district?.name || '—' }}</p></div>
                  <div class="col-md-4"><label class="form-label text-muted small">Division</label><p class="mb-0">{{ branch()!.policeStation?.district?.division?.name || '—' }}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card mb-4">
              <div class="card-header"><h6 class="mb-0">Employees at Branch</h6></div>
              <div class="card-body p-0">
                @if (employeesLoading()) {
                  <div class="p-3"><div class="skeleton-text"></div><div class="skeleton-text"></div></div>
                } @else if (employees().length === 0) {
                  <p class="text-muted text-center py-4 mb-0">No employees</p>
                } @else {
                  <div class="list-group list-group-flush">
                    @for (emp of employees(); track emp.id) {
                      <div class="list-group-item">
                        <div class="fw-semibold small">{{ emp.name }}</div>
                        <div class="text-muted small">{{ emp.designation }}</div>
                        <div class="text-muted small">{{ emp.email }}</div>
                        <div class="text-muted small">{{ emp.phoneNumber }}</div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <div class="card">
              <div class="card-header"><h6 class="mb-0">ATMs at Branch</h6></div>
              <div class="card-body p-0">
                @if (atmsLoading()) {
                  <div class="p-3"><div class="skeleton-text"></div><div class="skeleton-text"></div></div>
                } @else if (atms().length === 0) {
                  <p class="text-muted text-center py-4 mb-0">No ATMs</p>
                } @else {
                  <div class="table-responsive">
                    <table class="table table-sm mb-0">
                      <thead><tr><th>ID</th><th>Address</th><th>Limit</th><th>Status</th></tr></thead>
                      <tbody>
                        @for (atm of atms(); track atm.id) {
                          <tr>
                            <td class="font-mono small">{{ atm.id }}</td>
                            <td class="small">{{ atm.address }}</td>
                            <td class="small">{{ atm.limit }}</td>
                            <td><app-status-badge [status]="atm.status" /></td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-heading { height: 28px; width: 250px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; margin-bottom: 16px; }
    .skeleton-text { height: 14px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; width: 70%; margin-bottom: 8px; }
    .skeleton-text.short { width: 40%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .font-mono { font-size: 13px; }
  `]
})
export class BranchDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  branch = signal<any>(null);
  employees = signal<any[]>([]);
  atms = signal<any[]>([]);
  loading = signal(true);
  employeesLoading = signal(true);
  atmsLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadBranch(id);
    this.loadEmployees(id);
    this.loadAtms(id);
  }

  loadBranch(id: string) {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/branches/${id}`).subscribe({
      next: (data) => { this.branch.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/branches']); },
    });
  }

  loadEmployees(branchId: string) {
    this.employeesLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/employee/branch/${branchId}`).subscribe({
      next: (data) => { this.employees.set(data); this.employeesLoading.set(false); },
      error: () => this.employeesLoading.set(false),
    });
  }

  loadAtms(id: string) {
    this.atmsLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/atm/branch/${id}`).subscribe({
      next: (data) => { this.atms.set(data); this.atmsLoading.set(false); },
      error: () => this.atmsLoading.set(false),
    });
  }

  toggleStatus() {
    const b = this.branch();
    if (!b) return;
    const newStatus = b.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    this.http.put<any>(`${environment.apiUrl}/branches/${b.id}`, { ...b, status: newStatus }).subscribe({
      next: (updated) => this.branch.set(updated),
      error: () => {},
    });
  }
}
