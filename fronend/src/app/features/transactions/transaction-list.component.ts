import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Transactions</h1>
        <p>View all account transactions</p>
      </div>
      <a routerLink="/transactions/new" class="btn btn-primary">+ New Transaction</a>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    @for (j of [1,2,3,4,5,6]; track j) {
                      <td><div class="skeleton"></div></td>
                    }
                  </tr>
                }
              } @else if (transactions().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">No transactions found</td>
                </tr>
              } @else {
                @for (t of transactions(); track t.id) {
                  <tr>
                    <td class="font-mono">{{ t.transactionId }}</td>
                    <td>{{ t.senderName || '-' }}</td>
                    <td>{{ t.receiverName || '-' }}</td>
                    <td>{{ t.direction }}</td>
                    <td class="fw-bold">৳ {{ t.response?.amount | number:'1.2-2' }}</td>
                    <td><app-status-badge [status]="t.response?.status || 'PENDING'" /></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton { height: 16px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .font-mono { font-size: 13px; }
  `]
})
export class TransactionListComponent implements OnInit {
  private http = inject(HttpClient);
  transactions = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/account-transaction/all/`).subscribe({
      next: (data) => { this.transactions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
