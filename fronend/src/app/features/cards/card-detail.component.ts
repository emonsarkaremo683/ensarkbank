import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, StatusBadgeComponent],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/cards" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>Card Details</h1>
        <p>View and manage card information</p>
      </div>
    </div>

    @if (card()) {
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="credit-card" [class]="card()!.cardNetwork.toLowerCase()">
            <div class="card-top">
              <span class="card-chip"></span>
              <span class="card-network">{{ card()!.cardNetwork }}</span>
            </div>
            <div class="card-number">
              @for (part of formatCardNumber(); track $index) {
                <span>{{ part }}</span>
              }
            </div>
            <div class="card-bottom">
              <div>
                <span class="card-label">CARD HOLDER</span>
                <span class="card-value">{{ card()!.cardHolderName }}</span>
              </div>
              <div>
                <span class="card-label">EXPIRES</span>
                <span class="card-value">{{ card()!.expiryDate | date:'MM/yy' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Card Information</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Card ID</span>
                  <span class="info-value">#{{ card()!.cardId }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Card Number</span>
                  <span class="info-value font-mono">•••• •••• •••• {{ card()!.cardNumber?.slice(-4) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Card Type</span>
                  <span class="info-value">{{ card()!.cardType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Card Network</span>
                  <span class="info-value">{{ card()!.cardNetwork }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status</span>
                  <app-status-badge [status]="card()!.status" />
                </div>
                <div class="info-item">
                  <span class="info-label">CVV</span>
                  <span class="info-value font-mono">{{ card()!.cvv }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Expiry Date</span>
                  <span class="info-value">{{ card()!.expiryDate | date:'MMM dd, yyyy' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Account Number</span>
                  <span class="info-value font-mono">{{ card()!.accountNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Daily Limit</span>
                  <span class="info-value">৳ {{ card()!.dailyLimit | number:'1.2-2' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Monthly Limit</span>
                  <span class="info-value">৳ {{ card()!.monthlyLimit | number:'1.2-2' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">International</span>
                  <span class="info-value">{{ card()!.internationalEnabled ? 'Enabled' : 'Disabled' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Online Transactions</span>
                  <span class="info-value">{{ card()!.onlineTransactionEnabled ? 'Enabled' : 'Disabled' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-success btn-sm" (click)="changeStatus('ACTIVE')" [disabled]="card()!.status === 'ACTIVE'">
                  Activate
                </button>
                <button class="btn btn-warning btn-sm" (click)="changeStatus('BLOCKED')" [disabled]="card()!.status === 'BLOCKED'">
                  Block
                </button>
                <button class="btn btn-danger btn-sm" (click)="changeStatus('CANCELLED')" [disabled]="card()!.status === 'CANCELLED'">
                  Cancel
                </button>
                <button class="btn btn-secondary btn-sm" (click)="changeStatus('FREEZE')" [disabled]="card()!.status === 'FREEZE'">
                  Freeze
                </button>
                <button class="btn btn-outline-primary btn-sm" (click)="toggleInternational()">
                  {{ card()!.internationalEnabled ? 'Disable International' : 'Enable International' }}
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
    .credit-card {
      border-radius: 16px; padding: 28px; color: #fff; position: relative;
      min-height: 220px; display: flex; flex-direction: column; justify-content: space-between;
      background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .credit-card.visa { background: linear-gradient(135deg, #1a1a6c, #0f3460, #1a237e); }
    .credit-card.mastercard { background: linear-gradient(135deg, #b71c1c, #880e4f, #4a148c); }
    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .card-chip { width: 40px; height: 30px; background: linear-gradient(135deg, #f5d442, #d4a828); border-radius: 5px; }
    .card-network { font-size: 14px; font-weight: 700; letter-spacing: 2px; }
    .card-number { font-size: 22px; letter-spacing: 3px; font-weight: 600; display: flex; gap: 16px; }
    .card-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
    .card-label { display: block; font-size: 8px; letter-spacing: 1px; opacity: 0.8; margin-bottom: 2px; }
    .card-value { font-size: 13px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-label { font-size: 0.75rem; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 0.9375rem; font-weight: 500; color: #111827; }
  `]
})
export class CardDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  card = signal<any>(null);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/card/account/${id}`).subscribe({
        next: (data) => this.card.set(data),
        error: () => this.error.set('Failed to load card details.'),
      });
    }
  }

  formatCardNumber(): string[] {
    const num = this.card()?.cardNumber || '';
    return [num.slice(0, 4), num.slice(4, 8), num.slice(8, 12), num.slice(12, 16)];
  }

  changeStatus(status: string) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.http.patch(`${environment.apiUrl}/card/${id}/status`, null, { params: { status } }).subscribe({
      next: (updated: any) => {
        this.card.update(c => ({ ...c, status }));
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to update status.'),
    });
  }

  toggleInternational() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const current = this.card()?.internationalEnabled;
    this.http.patch(`${environment.apiUrl}/card/${id}/international`, null, { params: { enabled: (!current).toString() } }).subscribe({
      next: () => {
        this.card.update(c => ({ ...c, internationalEnabled: !current }));
      },
      error: (err) => this.error.set(err.error?.message || 'Failed to toggle international.'),
    });
  }
}
