import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0"><h1>Loans</h1><p>Manage loan applications and repayments</p></div>
      <a routerLink="/loans/apply" class="btn btn-primary">+ Apply for Loan</a>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Loan ID</th><th>Account</th><th>Principal</th><th>EMI</th><th>Outstanding</th><th>Status</th></tr></thead>
            <tbody>
              @if (loans().length === 0) {
                <tr><td colspan="6" class="text-center py-5 text-muted">No loans found</td></tr>
              } @else {
                @for (l of loans(); track l.loanId) {
                  <tr>
                    <td class="font-mono">#{{ l.loanId }}</td>
                    <td>{{ l.accountNumber }}</td>
                    <td class="fw-bold">৳ {{ l.principalAmount | number:'1.2-2' }}</td>
                    <td>৳ {{ l.emiAmount | number:'1.2-2' }}</td>
                    <td>৳ {{ l.outstandingBalance | number:'1.2-2' }}</td>
                    <td><app-status-badge [status]="l.status" /></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.font-mono { font-size: 13px; }`]
})
export class LoanListComponent implements OnInit {
  private http = inject(HttpClient);
  loans = signal<any[]>([]);
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/loans/all`).subscribe({ next: (d) => this.loans.set(d) });
  }
}
