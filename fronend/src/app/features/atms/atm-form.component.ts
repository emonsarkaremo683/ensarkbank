import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-atm-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/atms" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>Add New ATM</h1>
        <p>Register a new ATM machine</p>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">ATM Details</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Branch</label>
              <select class="form-select" [(ngModel)]="atmData.branchId" name="branchId" required>
                <option value="">Select Branch</option>
                @for (b of branches(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Status</label>
              <select class="form-select" [(ngModel)]="atmData.status" name="status" required>
                <option value="ACTIVE">Active</option>
                <option value="OFFLINE">Offline</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div class="col-md-12">
              <label class="form-label">Address</label>
              <input type="text" class="form-control" [(ngModel)]="atmData.address" name="address" required placeholder="Full ATM address" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Balance (৳)</label>
              <input type="number" class="form-control" [(ngModel)]="atmData.balance" name="balance" min="0" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Transaction Limit (৳)</label>
              <input type="number" class="form-control" [(ngModel)]="atmData.limit" name="limit" min="0" required />
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mb-4">
        <button type="submit" class="btn btn-primary" [disabled]="submitting()">
          @if (submitting()) {
            <span class="spinner-border spinner-border-sm me-1"></span> Creating...
          } @else {
            Create ATM
          }
        </button>
        <a routerLink="/atms" class="btn btn-outline-secondary">Cancel</a>
      </div>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }
    </form>
  `,
  styles: [`
    .page-header h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
    .page-header p { color: #6B7280; margin-bottom: 0; font-size: 0.875rem; }
    .card { border: 1px solid #E5E7EB; border-radius: 0.5rem; }
    .card-header { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; padding: 0.75rem 1.25rem; }
    .card-body { padding: 1.25rem; }
    .form-label { font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem; }
    .form-control, .form-select { font-size: 0.875rem; }
  `]
})
export class AtmFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  branches = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');

  atmData = {
    branchId: '',
    status: 'ACTIVE',
    address: '',
    balance: 0,
    limit: 0,
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
      error: () => {},
    });
  }

  onSubmit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');

    const payload = {
      ...this.atmData,
      branchId: Number(this.atmData.branchId),
    };

    this.http.post(`${environment.apiUrl}/atm`, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/atms']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to create ATM. Please check all fields.');
      },
    });
  }
}
