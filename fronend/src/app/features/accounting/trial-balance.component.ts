import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Trial Balance</h1>
        <p>Verify that total debits equal total credits</p>
      </div>
      <a routerLink="/accounting" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <form (ngSubmit)="loadTrialBalance()" class="row g-3 align-items-end">
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
            <button type="submit" class="btn btn-primary" [disabled]="loading()">Generate</button>
          </div>
        </form>
      </div>
    </div>

    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
      </div>
    } @else if (result()) {
      <div class="card">
        <div class="card-header">
          <strong>{{ result()!.branchName }}</strong> — Branch ID: {{ result()!.branchId }}
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>GL Code</th>
                  <th>Account Name</th>
                  <th>Account Number</th>
                  <th class="text-end">Debit (৳)</th>
                  <th class="text-end">Credit (৳)</th>
                </tr>
              </thead>
              <tbody>
                @for (line of result()!.lines; track line.accountNumber) {
                  <tr>
                    <td class="font-mono">{{ line.glCode }}</td>
                    <td>{{ line.accountName }}</td>
                    <td class="font-mono">{{ line.accountNumber }}</td>
                    <td class="text-end text-danger fw-bold">৳ {{ line.debit | number:'1.2-2' }}</td>
                    <td class="text-end text-success fw-bold">৳ {{ line.credit | number:'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="table-active">
                  <td colspan="3" class="text-end fw-bold">Total</td>
                  <td class="text-end fw-bold">৳ {{ result()!.totalDebit | number:'1.2-2' }}</td>
                  <td class="text-end fw-bold">৳ {{ result()!.totalCredit | number:'1.2-2' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="card-footer" [class.text-danger]="result()!.totalDebit !== result()!.totalCredit"
             [class.text-success]="result()!.totalDebit === result()!.totalCredit">
          @if (result()!.totalDebit === result()!.totalCredit) {
            <strong>Balanced ✓</strong>
          } @else {
            <strong>Unbalanced — Difference: ৳ {{ (result()!.totalDebit - result()!.totalCredit) | number:'1.2-2' }}</strong>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .font-mono { font-size: 13px; }
  `]
})
export class TrialBalanceComponent implements OnInit {
  private http = inject(HttpClient);

  branches = signal<any[]>([]);
  result = signal<any>(null);
  loading = signal(false);

  filter = { branchId: '', fromDate: '', toDate: '' };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
    });
    this.loadTrialBalance();
  }

  loadTrialBalance() {
    this.loading.set(true);
    this.result.set(null);

    const body: any = {};
    if (this.filter.branchId) body.branchId = this.filter.branchId;
    if (this.filter.fromDate) body.fromDate = this.filter.fromDate;
    if (this.filter.toDate) body.toDate = this.filter.toDate;

    this.http.post<any>(`${environment.apiUrl}/reports/trial-balance`, body).subscribe({
      next: (data) => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
