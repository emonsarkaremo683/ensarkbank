import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-atm-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, StatusBadgeComponent],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/atms" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>ATM Details</h1>
        <p>View and manage ATM information</p>
      </div>
    </div>

    @if (atm()) {
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">ATM Information</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">ATM ID</span>
                  <span class="info-value">#{{ atm()!.atmId }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status</span>
                  <app-status-badge [status]="atm()!.status" />
                </div>
                <div class="info-item full-width">
                  <span class="info-label">Address</span>
                  <span class="info-value">{{ atm()!.address }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Branch</span>
                  <span class="info-value">{{ atm()!.branchName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Routing Number</span>
                  <span class="info-value font-mono">{{ atm()!.routingNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Account Number</span>
                  <span class="info-value font-mono">{{ atm()!.accountNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Balance</span>
                  <span class="info-value">৳ {{ atm()!.balance | number:'1.2-2' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Transaction Limit</span>
                  <span class="info-value">৳ {{ atm()!.limit | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Status Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-column gap-2">
                <button class="btn btn-success btn-sm" (click)="changeStatus('ACTIVE')" [disabled]="atm()!.status === 'ACTIVE'">
                  Set Active
                </button>
                <button class="btn btn-secondary btn-sm" (click)="changeStatus('OFFLINE')" [disabled]="atm()!.status === 'OFFLINE'">
                  Set Offline
                </button>
                <button class="btn btn-danger btn-sm" (click)="changeStatus('OUT_OF_SERVICE')" [disabled]="atm()!.status === 'OUT_OF_SERVICE'">
                  Set Out of Service
                </button>
                <button class="btn btn-warning btn-sm" (click)="changeStatus('MAINTENANCE')" [disabled]="atm()!.status === 'MAINTENANCE'">
                  Set Maintenance
                </button>
              </div>
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
export class AtmDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  atm = signal<any>(null);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/atm/${id}`).subscribe({
        next: (data) => this.atm.set(data),
        error: () => this.error.set('Failed to load ATM details.'),
      });
    }
  }

  changeStatus(status: string) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.http.patch(`${environment.apiUrl}/atm/${id}/status`, null, { params: { status } }).subscribe({
      next: () => {
        this.atm.update(a => ({ ...a, status }));
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to update status.'),
    });
  }
}
