import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule, StatusBadgeComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Loan Detail</h1>
        <p>Loan #{{ loan()?.loanId || '...' }}</p>
      </div>
      <a routerLink="/loans" class="btn btn-outline-secondary">← Back</a>
    </div>

    @if (loading()) {
      <div class="card"><div class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2">Loading loan details...</p>
      </div></div>
    } @else if (!loan()) {
      <div class="card"><div class="card-body text-center py-5 text-muted">Loan not found.</div></div>
    } @else {
      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-icon bg-primary-subtle text-primary"><i class="bi bi-cash-stack"></i></div>
            <div class="info-content">
              <span class="info-label">Principal Amount</span>
              <span class="info-value">৳ {{ loan()!.principalAmount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-icon bg-warning-subtle text-warning"><i class="bi bi-percent"></i></div>
            <div class="info-content">
              <span class="info-label">Interest Rate</span>
              <span class="info-value">{{ loan()!.annualInterestRate }}% p.a.</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-icon bg-info-subtle text-info"><i class="bi bi-calendar-range"></i></div>
            <div class="info-content">
              <span class="info-label">Tenure</span>
              <span class="info-value">{{ loan()!.tenureMonths }} months</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-icon bg-success-subtle text-success"><i class="bi bi-wallet2"></i></div>
            <div class="info-content">
              <span class="info-label">Monthly EMI</span>
              <span class="info-value">৳ {{ loan()!.emiAmount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-content">
              <span class="info-label">Total Payable</span>
              <span class="info-value fw-bold">৳ {{ loan()!.totalPayable | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-content">
              <span class="info-label">Outstanding Balance</span>
              <span class="info-value fw-bold text-danger">৳ {{ loan()!.outstandingBalance | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-content">
              <span class="info-label">Status</span>
              <app-status-badge [status]="loan()!.status" />
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="info-card">
            <div class="info-content">
              <span class="info-label">Account</span>
              <span class="info-value font-mono">{{ loan()!.accountNumber }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <h6 class="mb-3">Important Dates</h6>
          <div class="row g-3">
            <div class="col-md-3">
              <span class="date-label">Application Date</span>
              <span class="date-value">{{ loan()!.applicationDate | date:'mediumDate' }}</span>
            </div>
            <div class="col-md-3">
              <span class="date-label">Approval Date</span>
              <span class="date-value">{{ loan()!.approvalDate ? (loan()!.approvalDate | date:'mediumDate') : '—' }}</span>
            </div>
            <div class="col-md-3">
              <span class="date-label">Disbursement Date</span>
              <span class="date-value">{{ loan()!.disbursementDate ? (loan()!.disbursementDate | date:'mediumDate') : '—' }}</span>
            </div>
            <div class="col-md-3">
              <span class="date-label">Next Due Date</span>
              <span class="date-value fw-bold">{{ loan()!.nextDueDate ? (loan()!.nextDueDate | date:'mediumDate') : '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      @if (loan()!.status === 'REJECTED') {
        <div class="card border-danger mb-4">
          <div class="card-body">
            <h6 class="text-danger mb-2">Rejection Reason</h6>
            <p class="mb-0">{{ loan()!.rejectionReason || 'No reason provided.' }}</p>
          </div>
        </div>
      }

      @if (loan()!.status === 'PENDING') {
        <div class="card mb-4">
          <div class="card-body">
            <h6 class="mb-3">Review Application</h6>
            @if (rejectMode()) {
              <div class="mb-3">
                <label class="form-label">Rejection Reason</label>
                <textarea class="form-control" rows="3" placeholder="Enter reason for rejection" [(ngModel)]="rejectReason"></textarea>
              </div>
            }
            <div class="d-flex gap-2">
              @if (!rejectMode()) {
                <button class="btn btn-success" [disabled]="actionLoading()" (click)="approve()">
                  @if (actionLoading()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  Approve
                </button>
                <button class="btn btn-outline-danger" (click)="rejectMode.set(true)">Reject</button>
              } @else {
                <button class="btn btn-danger" [disabled]="actionLoading() || !rejectReason" (click)="reject()">
                  @if (actionLoading()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                  Confirm Reject
                </button>
                <button class="btn btn-outline-secondary" (click)="rejectMode.set(false)">Cancel</button>
              }
            </div>
          </div>
        </div>
      }

      @if (loan()!.status === 'APPROVED') {
        <div class="card mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="mb-1">Loan Approved</h6>
                <p class="text-muted mb-0" style="font-size:13px;">This loan has been approved and is ready for disbursement.</p>
              </div>
              <button class="btn btn-primary" [disabled]="actionLoading()" (click)="disburse()">
                @if (actionLoading()) { <span class="spinner-border spinner-border-sm me-1"></span> }
                Disburse Loan
              </button>
            </div>
            @if (loan()!.disbursementTransactionRef) {
              <div class="mt-2 text-muted" style="font-size: 13px;">Transaction Ref: <span class="font-mono">{{ loan()!.disbursementTransactionRef }}</span></div>
            }
          </div>
        </div>
      }

      @if (loan()!.status === 'ACTIVE') {
        <div class="card mb-4">
          <div class="card-body">
            <h6 class="mb-3">Loan Active</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <div class="progress-info">
                  <span class="progress-label">Paid</span>
                  <span class="progress-value text-success">৳ {{ (loan()!.totalPayable! - loan()!.outstandingBalance!) | number:'1.2-2' }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="progress-info">
                  <span class="progress-label">Outstanding</span>
                  <span class="progress-value text-danger">৳ {{ loan()!.outstandingBalance | number:'1.2-2' }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="progress-info">
                  <span class="progress-label">Next EMI Due</span>
                  <span class="progress-value fw-bold">{{ loan()!.nextDueDate ? (loan()!.nextDueDate | date:'mediumDate') : '—' }}</span>
                </div>
              </div>
            </div>
            <div class="progress mt-3" style="height: 8px;">
              <div class="progress-bar bg-success" [style.width.%]="repaymentProgress()"></div>
            </div>
            <div class="text-muted mt-1" style="font-size: 12px;">{{ repaymentProgress() | number:'1.0-0' }}% repaid</div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .info-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; height: 100%; }
    .info-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .info-icon.bg-primary-subtle { background: #DBEAFE; color: #1E40AF; }
    .info-icon.bg-warning-subtle { background: #FEF3C7; color: #92400E; }
    .info-icon.bg-info-subtle { background: #DBEAFE; color: #1E40AF; }
    .info-icon.bg-success-subtle { background: #D1FAE5; color: #065F46; }
    .info-content { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 16px; font-weight: 600; color: #1E293B; }
    .date-label { font-size: 12px; color: #64748B; display: block; margin-bottom: 4px; }
    .date-value { font-size: 14px; font-weight: 500; color: #1E293B; display: block; }
    .progress-info { display: flex; flex-direction: column; gap: 4px; }
    .progress-label { font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }
    .progress-value { font-size: 16px; font-weight: 600; }
    .font-mono { font-size: 13px; }
    .form-label { font-weight: 500; font-size: 13px; color: #475569; }
    .form-control { border-radius: 8px; padding: 10px 14px; border: 1px solid #E2E8F0; }
    .btn { border-radius: 8px; padding: 10px 20px; font-weight: 500; }
    .alert { border-radius: 8px; font-size: 14px; }
  `]
})
export class LoanDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  loan = signal<any>(null);
  loading = signal(true);
  error = signal('');
  actionLoading = signal(false);
  rejectMode = signal(false);
  rejectReason = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/loans/${id}`).subscribe({
        next: (data) => { this.loan.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  repaymentProgress(): number {
    const l = this.loan();
    if (!l || !l.totalPayable || !l.outstandingBalance || l.totalPayable === 0) return 0;
    return ((l.totalPayable - l.outstandingBalance) / l.totalPayable) * 100;
  }

  approve() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.actionLoading.set(true);
    this.error.set('');

    this.http.put<any>(`${environment.apiUrl}/loans/${id}/approve`, {}).subscribe({
      next: (data) => { this.loan.set(data); this.actionLoading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Failed to approve loan.'); this.actionLoading.set(false); },
    });
  }

  reject() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || !this.rejectReason) return;

    this.actionLoading.set(true);
    this.error.set('');

    this.http.put<any>(`${environment.apiUrl}/loans/${id}/reject?reason=${encodeURIComponent(this.rejectReason)}`, {}).subscribe({
      next: (data) => { this.loan.set(data); this.actionLoading.set(false); this.rejectMode.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Failed to reject loan.'); this.actionLoading.set(false); },
    });
  }

  disburse() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.actionLoading.set(true);
    this.error.set('');

    this.http.post<any>(`${environment.apiUrl}/loans/${id}/disburse`, {}).subscribe({
      next: (data) => { this.loan.set(data); this.actionLoading.set(false); },
      error: (err) => { this.error.set(err.error?.message || 'Failed to disburse loan.'); this.actionLoading.set(false); },
    });
  }
}
