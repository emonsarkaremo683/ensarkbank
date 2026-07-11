import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Journal</h1>
        <p>View journal entries by account</p>
      </div>
      <a routerLink="/accounting" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <form (ngSubmit)="search()" class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label">Account Number</label>
            <input type="text" class="form-control" [(ngModel)]="accountNumber" name="accountNumber" required />
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-primary" [disabled]="loading()">Search</button>
          </div>
        </form>
      </div>
    </div>

    @if (entries().length > 0 || loading()) {
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction ID</th>
                  <th>Particulars</th>
                  <th>Account Number</th>
                  <th>Entry Type</th>
                  <th>Amount</th>
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
                } @else if (entries().length === 0) {
                  <tr>
                    <td colspan="6" class="text-center py-5 text-muted">No journal entries found</td>
                  </tr>
                } @else {
                  @for (e of entries(); track e.id) {
                    <tr>
                      <td>{{ e.date | date:'mediumDate' }}</td>
                      <td class="font-mono">{{ e.transactionId }}</td>
                      <td>{{ e.particulars }}</td>
                      <td class="font-mono">{{ e.accountNumber }}</td>
                      <td>
                        <span class="badge" [class]="e.entryType === 'DEBIT' ? 'bg-danger' : 'bg-success'">
                          {{ e.entryType }}
                        </span>
                      </td>
                      <td class="fw-bold">৳ {{ e.amount | number:'1.2-2' }}</td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .skeleton { height: 16px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .font-mono { font-size: 13px; }
  `]
})
export class JournalComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  accountNumber = '';
  entries = signal<any[]>([]);
  loading = signal(false);

  ngOnInit() {
    const accNum = this.route.snapshot.queryParamMap.get('accountNumber');
    if (accNum) {
      this.accountNumber = accNum;
      this.search();
    }
  }

  search() {
    if (!this.accountNumber.trim()) return;
    this.loading.set(true);
    this.entries.set([]);
    this.http.get<any[]>(`${environment.apiUrl}/history/${this.accountNumber.trim()}`).subscribe({
      next: (data) => { this.entries.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
