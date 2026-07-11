import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mb-4">
      <a routerLink="/branches" class="btn btn-outline-secondary btn-sm mb-3">
        <i class="bi bi-arrow-left me-1"></i> Back to Branches
      </a>
      <h2>{{ isEdit() ? 'Edit Branch' : 'New Branch' }}</h2>
    </div>

    @if (loading()) {
      <div class="card"><div class="card-body"><div class="skeleton-text"></div><div class="skeleton-text short"></div></div></div>
    } @else {
      <div class="card" style="max-width: 720px;">
        <div class="card-body">
          <form (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="form.name" name="name" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Branch Code <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="form.branchCode" name="branchCode" required />
              </div>
              <div class="col-12">
                <label class="form-label">Address <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="form.address" name="address" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Routing Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="form.routingNumber" name="routingNumber" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone Number <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="form.phoneNumber" name="phoneNumber" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Type <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="form.type" name="type" required>
                  <option value="">Select Type</option>
                  <option value="HEAD_OFFICE">Head Office</option>
                  <option value="BRANCH">Branch</option>
                  <option value="AGENT_BANK">Agent Bank</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Status <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="form.status" name="status" required>
                  <option value="">Select Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Police Station <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="form.policeStationId" name="policeStationId" required>
                  <option value="">Select Police Station</option>
                  @for (ps of policeStations(); track ps.id) {
                    <option [value]="ps.id">{{ ps.name }} — {{ ps.district?.name }}</option>
                  }
                </select>
              </div>
            </div>

            @if (error()) {
              <div class="alert alert-danger mt-3 mb-0">{{ error() }}</div>
            }

            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-primary" [disabled]="submitting()">
                @if (submitting()) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                {{ isEdit() ? 'Update Branch' : 'Create Branch' }}
              </button>
              <a routerLink="/branches" class="btn btn-outline-secondary">Cancel</a>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .skeleton-text { height: 14px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; width: 70%; margin-bottom: 12px; }
    .skeleton-text.short { width: 40%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class BranchFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');
  policeStations = signal<any[]>([]);

  form = {
    name: '',
    address: '',
    routingNumber: '',
    branchCode: '',
    email: '',
    phoneNumber: '',
    type: '',
    status: '',
    policeStationId: '',
  };

  ngOnInit() {
    this.loadPoliceStations();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.loadBranch(id);
    }
  }

  loadPoliceStations() {
    this.http.get<any[]>(`${environment.apiUrl}/policestation/`).subscribe({
      next: (data) => this.policeStations.set(data),
      error: () => {},
    });
  }

  loadBranch(id: string) {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/branches/${id}`).subscribe({
      next: (b) => {
        this.form.name = b.name || '';
        this.form.address = b.address || '';
        this.form.routingNumber = b.routingNumber || '';
        this.form.branchCode = b.branchCode || '';
        this.form.email = b.email || '';
        this.form.phoneNumber = b.phoneNumber || '';
        this.form.type = b.type || '';
        this.form.status = b.status || '';
        this.form.policeStationId = b.policeStation?.id || '';
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/branches']); },
    });
  }

  onSubmit() {
    this.error.set('');
    this.submitting.set(true);

    const body: any = {
      name: this.form.name,
      address: this.form.address,
      routingNumber: this.form.routingNumber,
      branchCode: this.form.branchCode,
      email: this.form.email,
      phoneNumber: this.form.phoneNumber,
      type: this.form.type,
      status: this.form.status,
      policeStation: { id: Number(this.form.policeStationId) },
    };

    const id = this.route.snapshot.paramMap.get('id');
    const req = id
      ? this.http.put<any>(`${environment.apiUrl}/branches/${id}`, body)
      : this.http.post<any>(`${environment.apiUrl}/branches`, body);

    req.subscribe({
      next: () => this.router.navigate(['/branches']),
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Something went wrong. Please try again.');
      },
    });
  }
}
