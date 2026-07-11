import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-beneficiary-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/beneficiaries" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>Beneficiary Details</h1>
        <p>View beneficiary information</p>
      </div>
    </div>

    @if (beneficiary()) {
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Beneficiary Information</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">ID</span>
                  <span class="info-value">#{{ beneficiary()!.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Customer ID</span>
                  <span class="info-value">#{{ beneficiary()!.customerId }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">Name</span>
                  <span class="info-value">{{ beneficiary()!.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Account Number</span>
                  <span class="info-value font-mono">{{ beneficiary()!.accNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Beneficiary Type</span>
                  <span class="info-value">{{ beneficiary()!.beneficiaryType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Provider</span>
                  <span class="info-value">{{ beneficiary()!.provider }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Routing Number</span>
                  <span class="info-value font-mono">{{ beneficiary()!.routingNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Actions</h5>
            </div>
            <div class="card-body">
              <button class="btn btn-danger w-100" (click)="deleteBeneficiary()">
                <i class="bi bi-trash me-1"></i> Delete Beneficiary
              </button>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    }

    @if (error()) {
      <div class="alert alert-danger mt-3">{{ error() }}</div>
    }
  `,
  styles: [`
    .page-header h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
    .page-header p { color: #6B7280; margin-bottom: 0; font-size: 0.875rem; }
    .card { border: 1px solid #E5E7EB; border-radius: 0.5rem; }
    .card-header { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; padding: 0.75rem 1.25rem; }
    .card-body { padding: 1.25rem; }
    .font-mono { font-family: 'Courier New', monospace; font-size: 13px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-item.full-width { grid-column: 1 / -1; }
    .info-label { font-size: 0.75rem; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 0.9375rem; font-weight: 500; color: #111827; }
  `]
})
export class BeneficiaryDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  beneficiary = signal<any>(null);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/beneficiary/${id}`).subscribe({
        next: (data) => this.beneficiary.set(data),
        error: () => this.error.set('Failed to load beneficiary details.'),
      });
    }
  }

  deleteBeneficiary() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    if (!confirm('Are you sure you want to delete this beneficiary?')) return;

    this.http.delete(`${environment.apiUrl}/beneficiary/${id}`).subscribe({
      next: () => this.router.navigate(['/beneficiaries']),
      error: (err) => this.error.set(err.error?.message || 'Failed to delete beneficiary.'),
    });
  }
}
