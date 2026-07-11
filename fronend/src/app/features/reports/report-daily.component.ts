import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-report-daily',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="d-flex align-items-center gap-3 mb-4">
      <a routerLink="/reports" class="btn btn-outline-secondary btn-sm">&larr; Back</a>
      <div class="page-header mb-0"><h1>Daily Report</h1></div>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label">Select Date</label>
            <input type="date" class="form-control" [(ngModel)]="selectedDate" />
          </div>
          <div class="col-md-3">
            <button class="btn btn-primary" (click)="generate()" [disabled]="loading()">
              @if (loading()) { <span class="spinner-border spinner-border-sm me-1"></span> } Generate
            </button>
          </div>
          <div class="col-md-5 text-end">
            <button class="btn btn-outline-secondary" [disabled]="ledgerEntries().length === 0">🖨 Print / Export</button>
          </div>
        </div>
      </div>
    </div>

    @if (ledgerEntries().length > 0) {
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h6 class="text-muted mb-1">Total Entries</h6>
              <h3>{{ ledgerEntries().length }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h6 class="text-muted mb-1">Total Volume</h6>
              <h3>৳ {{ totalVolume() | number:'1.2-2' }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h6 class="text-muted mb-1">Successful</h6>
              <h3 class="text-success">{{ successfulCount() }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h6 class="text-muted mb-1">Failed</h6>
              <h3 class="text-danger">{{ failedCount() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><strong>Ledger Entries</strong></div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Branch</th>
                  <th>Opening Balance</th>
                  <th>Closing Balance</th>
                  <th>Transactions</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of ledgerEntries(); track entry.accountNumber) {
                  <tr>
                    <td class="font-mono fw-bold">{{ entry.accountNumber }}</td>
                    <td>{{ entry.branchName || '-' }}</td>
                    <td>৳ {{ entry.openingBalance | number:'1.2-2' }}</td>
                    <td>৳ {{ entry.closingBalance | number:'1.2-2' }}</td>
                    <td>{{ entry.journalEntries?.length ?? 0 }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else if (!loading() && searched()) {
      <div class="card"><div class="card-body text-center py-5 text-muted">No ledger entries found for this date.</div></div>
    }
  `,
  styles: [`
    .font-mono { font-size: 13px; }
  `]
})
export class ReportDailyComponent implements OnInit {
  private http = inject(HttpClient);

  selectedDate = '';
  ledgerEntries = signal<any[]>([]);
  loading = signal(false);
  searched = signal(false);

  totalVolume = signal(0);
  successfulCount = signal(0);
  failedCount = signal(0);

  ngOnInit() {
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  generate() {
    if (!this.selectedDate) return;
    this.loading.set(true);
    this.searched.set(true);

    const startOfDay = this.selectedDate + 'T00:00:00';
    const endOfDay = this.selectedDate + 'T23:59:59';

    this.http.post<any[]>(`${environment.apiUrl}/reports/ledger`, {
      fromDate: startOfDay,
      toDate: endOfDay,
    }).subscribe({
      next: (data) => {
        this.ledgerEntries.set(data);
        this.computeStats(data);
        this.loading.set(false);
      },
      error: () => { this.ledgerEntries.set([]); this.loading.set(false); },
    });
  }

  private computeStats(entries: any[]) {
    let volume = 0;
    let success = 0;
    let failed = 0;
    for (const e of entries) {
      const journals = e.journalEntries ?? [];
      for (const j of journals) {
        volume += j.amount ?? 0;
        if (j.status === 'SUCCESS') success++;
        else if (j.status === 'FAILED') failed++;
      }
    }
    this.totalVolume.set(volume);
    this.successfulCount.set(success);
    this.failedCount.set(failed);
  }
}
