import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Balance Sheet</h1>
        <p>Assets, liabilities, and equity overview</p>
      </div>
      <a routerLink="/reports" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="card mb-4">
      <div class="card-body">
        <form (ngSubmit)="loadBalanceSheet()" class="row g-3 align-items-end">
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
      <div class="card mb-3">
        <div class="card-header">
          <strong>{{ result()!.branchName }}</strong> — Branch ID: {{ result()!.branchId }}
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <strong>Assets</strong>
            </div>
            <div class="card-body p-0">
              <table class="table mb-0">
                <tbody>
                  @for (line of result()!.assets.lines; track line.glCode) {
                    <tr>
                      <td class="font-mono text-muted">{{ line.glCode }}</td>
                      <td>{{ line.accountName }}</td>
                      <td class="text-end fw-bold">৳ {{ line.amount | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="table-active">
                    <td colspan="2" class="text-end fw-bold">Total Assets</td>
                    <td class="text-end fw-bold">৳ {{ result()!.assets.total | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header bg-warning text-dark">
              <strong>Liabilities</strong>
            </div>
            <div class="card-body p-0">
              <table class="table mb-0">
                <tbody>
                  @for (line of result()!.liabilities.lines; track line.glCode) {
                    <tr>
                      <td class="font-mono text-muted">{{ line.glCode }}</td>
                      <td>{{ line.accountName }}</td>
                      <td class="text-end fw-bold">৳ {{ line.amount | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="table-active">
                    <td colspan="2" class="text-end fw-bold">Total Liabilities</td>
                    <td class="text-end fw-bold">৳ {{ result()!.liabilities.total | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header bg-success text-white">
              <strong>Equity</strong>
            </div>
            <div class="card-body p-0">
              <table class="table mb-0">
                <tbody>
                  @for (line of result()!.equity.lines; track line.glCode) {
                    <tr>
                      <td class="font-mono text-muted">{{ line.glCode }}</td>
                      <td>{{ line.accountName }}</td>
                      <td class="text-end fw-bold">৳ {{ line.amount | number:'1.2-2' }}</td>
                    </tr>
                  }
                </tbody>
                <tfoot>
                  <tr class="table-active">
                    <td colspan="2" class="text-end fw-bold">Total Equity</td>
                    <td class="text-end fw-bold">৳ {{ result()!.equity.total | number:'1.2-2' }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-footer d-flex justify-content-between align-items-center"
             [class.text-success]="result()!.totalAssets === result()!.totalLiabilitiesAndEquity"
             [class.text-danger]="result()!.totalAssets !== result()!.totalLiabilitiesAndEquity">
          <span class="fw-bold">Total Assets: ৳ {{ result()!.totalAssets | number:'1.2-2' }}</span>
          <span class="fw-bold">Total Liabilities + Equity: ৳ {{ result()!.totalLiabilitiesAndEquity | number:'1.2-2' }}</span>
          @if (result()!.totalAssets === result()!.totalLiabilitiesAndEquity) {
            <span class="badge bg-success">Balanced ✓</span>
          } @else {
            <span class="badge bg-danger">Unbalanced</span>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .font-mono { font-size: 13px; }
  `]
})
export class BalanceSheetComponent implements OnInit {
  private http = inject(HttpClient);

  branches = signal<any[]>([]);
  result = signal<any>(null);
  loading = signal(false);

  filter = { branchId: '', fromDate: '', toDate: '' };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
    });
    this.loadBalanceSheet();
  }

  loadBalanceSheet() {
    this.loading.set(true);
    this.result.set(null);

    const body: any = {};
    if (this.filter.branchId) body.branchId = this.filter.branchId;
    if (this.filter.fromDate) body.fromDate = this.filter.fromDate;
    if (this.filter.toDate) body.toDate = this.filter.toDate;

    this.http.post<any>(`${environment.apiUrl}/reports/balance-sheet`, body).subscribe({
      next: (data) => { this.result.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
