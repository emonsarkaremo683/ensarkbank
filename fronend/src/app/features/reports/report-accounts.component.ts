import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-report-accounts',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="d-flex align-items-center gap-3 mb-4">
      <a routerLink="/reports" class="btn btn-outline-secondary btn-sm">&larr; Back</a>
      <div class="page-header mb-0"><h1>Account Statement</h1></div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Account Number</label>
            <input type="text" class="form-control" [(ngModel)]="accountNumber" placeholder="Enter account number" />
          </div>
          <div class="col-md-3">
            <label class="form-label">From Date</label>
            <input type="date" class="form-control" [(ngModel)]="fromDate" />
          </div>
          <div class="col-md-3">
            <label class="form-label">To Date</label>
            <input type="date" class="form-control" [(ngModel)]="toDate" />
          </div>
          <div class="col-md-3">
            <button class="btn btn-primary w-100" (click)="search()" [disabled]="loading()">Search</button>
          </div>
        </div>
      </div>
    </div>

    @if (transactions().length > 0) {
      <div class="card mb-4">
        <div class="card-header"><strong>Account Info</strong></div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4"><span class="text-muted">Account Number:</span> <strong>{{ accountNumber }}</strong></div>
            <div class="col-md-4"><span class="text-muted">Total Transactions:</span> <strong>{{ transactions().length }}</strong></div>
            <div class="col-md-4"><span class="text-muted">Period:</span> <strong>{{ fromDate }} — {{ toDate }}</strong></div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Channel</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                @for (t of transactions(); track t.id) {
                  <tr>
                    <td>{{ t.createdAt | date:'medium' }}</td>
                    <td class="font-mono">{{ t.transactionId }}</td>
                    <td><span class="badge bg-{{ t.direction === 'CREDIT' ? 'success' : 'danger' }}">{{ t.direction }}</span></td>
                    <td>{{ t.channel || '-' }}</td>
                    <td class="fw-bold">৳ {{ t.response?.amount | number:'1.2-2' }}</td>
                    <td><span class="badge bg-{{ t.response?.status === 'SUCCESS' ? 'success' : t.response?.status === 'FAILED' ? 'danger' : 'warning' }}">{{ t.response?.status }}</span></td>
                    <td>৳ {{ t.balanceAfter | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="row text-center">
            <div class="col-md-4">
              <h6 class="text-muted">Total Debits</h6>
              <h4 class="text-danger">৳ {{ totalDebits() | number:'1.2-2' }}</h4>
            </div>
            <div class="col-md-4">
              <h6 class="text-muted">Total Credits</h6>
              <h4 class="text-success">৳ {{ totalCredits() | number:'1.2-2' }}</h4>
            </div>
            <div class="col-md-4">
              <h6 class="text-muted">Closing Balance</h6>
              <h4>৳ {{ closingBalance() | number:'1.2-2' }}</h4>
            </div>
          </div>
        </div>
      </div>
    } @else if (!loading() && searched()) {
      <div class="card"><div class="card-body text-center py-5 text-muted">No transactions found for this account.</div></div>
    }
  `,
  styles: [`
    .font-mono { font-size: 13px; }
  `]
})
export class ReportAccountsComponent implements OnInit {
  private http = inject(HttpClient);

  accountNumber = '';
  fromDate = '';
  toDate = '';
  transactions = signal<any[]>([]);
  loading = signal(false);
  searched = signal(false);

  totalDebits = signal(0);
  totalCredits = signal(0);
  closingBalance = signal(0);

  ngOnInit() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.toDate = today.toISOString().split('T')[0];
    this.fromDate = firstOfMonth.toISOString().split('T')[0];
  }

  search() {
    if (!this.accountNumber.trim()) return;
    this.loading.set(true);
    this.searched.set(true);

    this.http.get<any[]>(`${environment.apiUrl}/account-transaction/accountNumber/${this.accountNumber.trim()}`).subscribe({
      next: (data) => {
        const filtered = data.filter((t: any) => {
          if (!t.createdAt) return true;
          const d = new Date(t.createdAt);
          const from = this.fromDate ? new Date(this.fromDate) : null;
          const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;
          return (!from || d >= from) && (!to || d <= to);
        });
        this.transactions.set(filtered);
        this.computeSummary(filtered);
        this.loading.set(false);
      },
      error: () => { this.transactions.set([]); this.loading.set(false); },
    });
  }

  private computeSummary(list: any[]) {
    let debits = 0;
    let credits = 0;
    for (const t of list) {
      const amt = t.response?.amount ?? 0;
      if (t.direction === 'CREDIT') credits += amt;
      else debits += amt;
    }
    this.totalDebits.set(debits);
    this.totalCredits.set(credits);
    const last = list.length > 0 ? list[list.length - 1] : null;
    this.closingBalance.set(last?.balanceAfter ?? (credits - debits));
  }
}
