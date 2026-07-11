import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Accounts</h1>
        <p>Manage bank accounts and balances</p>
      </div>
      <a routerLink="/accounts/new" class="btn btn-primary">+ New Account</a>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Actions</th>
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
              } @else if (accounts().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">No accounts found</td>
                </tr>
              } @else {
                @for (a of accounts(); track a.id) {
                  <tr style="cursor: pointer" [routerLink]="['/accounts', a.id]">
                    <td class="font-mono fw-semibold">{{ a.accountNumber }}</td>
                    <td>{{ a.accountType }}</td>
                    <td class="fw-bold">৳ {{ a.availableBalance | number:'1.2-2' }}</td>
                    <td>{{ a.branchName }}</td>
                    <td><app-status-badge [status]="a.accountStatus" /></td>
                    <td>
                      <a [routerLink]="['/accounts', a.id]" class="btn btn-sm btn-outline-primary">View</a>
                    </td>
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
export class AccountListComponent implements OnInit {
  private http = inject(HttpClient);
  accounts = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/account/all/`).subscribe({
      next: (data) => { this.accounts.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
