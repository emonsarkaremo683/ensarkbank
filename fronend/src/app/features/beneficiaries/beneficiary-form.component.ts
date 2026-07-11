import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-beneficiary-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/beneficiaries" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>Add Beneficiary</h1>
        <p>Register a new beneficiary</p>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Beneficiary Details</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Customer</label>
              <select class="form-select" [(ngModel)]="beneficiaryData.customerId" name="customerId" required>
                <option value="">Select Customer</option>
                @for (c of customers(); track c.id) {
                  <option [value]="c.id">{{ c.name }} ({{ c.email }})</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Beneficiary Type</label>
              <select class="form-select" [(ngModel)]="beneficiaryData.beneficiaryType" name="beneficiaryType" required>
                <option value="">Select Type</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="BANK">Bank</option>
                <option value="CARD">Card</option>
                <option value="INTER_BANK">Inter Bank</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Account Number</label>
              <input type="text" class="form-control" [(ngModel)]="beneficiaryData.accNumber" name="accNumber" required placeholder="Enter account number" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" [(ngModel)]="beneficiaryData.name" name="name" required placeholder="Beneficiary name" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Provider</label>
              <input type="text" class="form-control" [(ngModel)]="beneficiaryData.provider" name="provider" required placeholder="e.g. Dutch-Bangla Bank" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Routing Number</label>
              <input type="text" class="form-control" [(ngModel)]="beneficiaryData.routingNumber" name="routingNumber" required placeholder="Enter routing number" />
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mb-4">
        <button type="submit" class="btn btn-primary" [disabled]="submitting()">
          @if (submitting()) {
            <span class="spinner-border spinner-border-sm me-1"></span> Creating...
          } @else {
            Create Beneficiary
          }
        </button>
        <a routerLink="/beneficiaries" class="btn btn-outline-secondary">Cancel</a>
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
export class BeneficiaryFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  customers = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');

  beneficiaryData = {
    customerId: '',
    beneficiaryType: '',
    accNumber: '',
    name: '',
    provider: '',
    routingNumber: '',
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/customer/`).subscribe({
      next: (data) => this.customers.set(data),
      error: () => {},
    });
  }

  onSubmit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');

    const payload = {
      ...this.beneficiaryData,
      customerId: Number(this.beneficiaryData.customerId),
    };

    this.http.post(`${environment.apiUrl}/beneficiary/`, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/beneficiaries']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to create beneficiary. Please check all fields.');
      },
    });
  }
}
