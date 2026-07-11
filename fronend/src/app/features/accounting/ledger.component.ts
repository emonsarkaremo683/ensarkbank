import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>General Ledger</h1>
        <p>View account ledgers with opening and closing balances</p>
      </div>
      <a routerLink="/accounting" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <form (ngSubmit)="loadLedger()" class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label">Branch</label>
            <select class="form-select" [(ngModel)]="filter.branchId" name="branchId">
              <option value="">All Branches</option>
              @for (b of branches(); track b.id) {
                <option [value]="b.id">{{ b.name }}</option>
              }
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">From Date</label>
            <input type="date" class="form-control" [(ngModel)]="filter.fromDate" name="fromDate" />
          </div>
          <div class="col-md-3">
            <label class="form-label">To Date</label>
            <input type="date" class="form-control" [(ngModel)]="filter.toDate" name="toDate" />
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-primary" [disabled]="loading()">Load Ledger</button>
          </div>
        </form>
      </div>
    </div>

    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>
    } @else {
      @for (ledger of ledgers(); track ledger.accountNumber) {
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ ledger.branchName }}</strong> — Account: {{ ledger.accountNumber }}
            </div>
            <div>
              <span class="text-muted">Opening: </span>
              <span class="fw-bold">৳ {{ ledger.openingBalance | number:'1.2-2' }}</span>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Particulars</th>
                    <th>Account Number</th>
                    <th>Account Name</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of ledger.entries; track entry.journalId) {
                    <tr>
                      <td>{{ entry.date | date:'mediumDate' }}</td>
                      <td class="font-mono">{{ entry.transactionId }}</td>
                      <td>{{ entry.particulars }}</td>
                      <td class="font-mono">{{ entry.accountNumber }}</td>
                      <td>{{ entry.accountName }}</td>
                      <td class="text-danger fw-bold">৳ {{ entry.debit | number:'1.2-2' }}</td>
                      <td class="text-success fw-bold">৳ {{ entry.credit | number:'1.2-2' }}</td>
                      <td class="fw-bold">৳ {{ entry.balance | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer text-end">
            <span class="text-muted">Closing Balance: </span>
            <span class="fw-bold fs-5">৳ {{ ledger.closingBalance | number:'1.2-2' }}</span>
          </div>
        </div>
      } @empty {
        <div class="card">
          <div class="card-body text-center py-5 text-muted">No ledger data found. Adjust filters and try again.</div>
        </div>
      }
    }
  `,
  styles: [`
    .font-mono { font-size: 13px; }
  `]
})
export class LedgerComponent implements OnInit {
  private http = inject(HttpClient);

  branches = signal<any[]>([]);
  ledgers = signal<any[]>([]);
  loading = signal(false);

  filter = { branchId: '', fromDate: '', toDate: '' };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
    });
    this.loadLedger();
  }

  loadLedger() {
    this.loading.set(true);
    this.ledgers.set([]);

    const body: any = {};
    if (this.filter.branchId) body.branchId = this.filter.branchId;
    if (this.filter.fromDate) body.fromDate = this.filter.fromDate;
    if (this.filter.toDate) body.toDate = this.filter.toDate;

    this.http.post<any[]>(`${environment.apiUrl}/reports/ledger`, body).subscribe({
      next: (data) => { this.ledgers.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
