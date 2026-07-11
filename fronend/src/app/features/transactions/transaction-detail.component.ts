import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, StatusBadgeComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Transaction Detail</h1>
        <p>Transaction #{{ transaction()?.transactionId || '...' }}</p>
      </div>
      <a routerLink="/transactions" class="btn btn-outline-secondary">← Back</a>
    </div>

    @if (loading()) {
      <div class="card"><div class="card-body text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2">Loading transaction details...</p>
      </div></div>
    } @else if (!transaction()) {
      <div class="card"><div class="card-body text-center py-5 text-muted">Transaction not found.</div></div>
    } @else {
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="detail-card">
            <div class="detail-card-header">Transaction Info</div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID</span>
              <span class="detail-value font-mono">{{ transaction()!.transactionId }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <app-status-badge [status]="transaction()!.response?.status || 'PENDING'" />
            </div>
            <div class="detail-row">
              <span class="detail-label">Direction</span>
              <span class="detail-value">{{ transaction()!.direction }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">{{ transaction()!.response?.transactionType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Channel</span>
              <span class="detail-value">{{ transaction()!.response?.channel }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount</span>
              <span class="detail-value fw-bold text-primary">৳ {{ transaction()!.response?.amount | number:'1.2-2' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Charge</span>
              <span class="detail-value">৳ {{ transaction()!.response?.chargeAmount | number:'1.2-2' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">VAT</span>
              <span class="detail-value">৳ {{ transaction()!.response?.vatAmount | number:'1.2-2' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Remarks</span>
              <span class="detail-value">{{ transaction()!.response?.remarks || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-card">
            <div class="detail-card-header">Account Info</div>
            <div class="detail-row">
              <span class="detail-label">Sender Account</span>
              <span class="detail-value font-mono">{{ transaction()!.senderAccountNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Sender Name</span>
              <span class="detail-value">{{ transaction()!.senderName || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Receiver Account</span>
              <span class="detail-value font-mono">{{ transaction()!.receiverAccountNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Receiver Name</span>
              <span class="detail-value">{{ transaction()!.receiverName || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bank</span>
              <span class="detail-value">{{ transaction()!.bankName || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      @if (transaction()!.response?.journals?.length) {
        <div class="card">
          <div class="card-body">
            <h6 class="mb-3">Journal Entries</h6>
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Account Number</th>
                    <th>Entry Type</th>
                    <th>Amount</th>
                    <th>Particulars</th>
                  </tr>
                </thead>
                <tbody>
                  @for (j of transaction()!.response!.journals; track j.id) {
                    <tr>
                      <td class="font-mono">{{ j.accountNumber }}</td>
                      <td>
                        <span class="badge" [class]="j.entryType === 'DEBIT' ? 'bg-danger-subtle' : 'bg-success-subtle'">{{ j.entryType }}</span>
                      </td>
                      <td class="fw-bold">৳ {{ j.amount | number:'1.2-2' }}</td>
                      <td>{{ j.particulars || '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .detail-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 0; overflow: hidden; height: 100%; }
    .detail-card-header { font-size: 14px; font-weight: 600; color: #1E293B; padding: 16px 20px; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid #F1F5F9; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: #64748B; }
    .detail-value { font-size: 13px; color: #1E293B; font-weight: 500; }
    .font-mono { font-size: 13px; }
    .badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
    .bg-success-subtle { background: #D1FAE5 !important; color: #065F46 !important; }
    .bg-danger-subtle { background: #FEE2E2 !important; color: #991B1B !important; }
  `]
})
export class TransactionDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  transaction = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<any>(`${environment.apiUrl}/account-transaction/${id}`).subscribe({
        next: (data) => { this.transaction.set(data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }
}
