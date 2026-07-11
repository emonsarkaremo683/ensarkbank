import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, StatusBadgeComponent],
  template: `
    <a routerLink="/accounts" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back to Accounts
    </a>

    @if (loading()) {
      <div class="skeleton-header"></div>
      <div class="balance-grid">
        @for (i of [1,2,3]; track i) {
          <div class="card skeleton-card"><div class="skeleton skeleton-line lg"></div></div>
        }
      </div>
    } @else if (!account()) {
      <div class="card empty-state">
        <p>Account not found.</p>
      </div>
    } @else {
      <div class="page-header">
        <div class="header-left">
          <h1 class="account-number">{{ account().accountNumber }}</h1>
          <span class="type-badge">{{ account().accountType }}</span>
          <app-status-badge [status]="account().accountStatus" />
        </div>
        <div class="header-actions">
          <select class="status-select" [(ngModel)]="selectedStatus" (change)="changeStatus(selectedStatus)">
            <option value="" disabled>Change Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="FREEZE">FREEZE</option>
          </select>
        </div>
      </div>

      <div class="balance-grid">
        <div class="card balance-card available">
          <span class="balance-label">Available Balance</span>
          <span class="balance-value">৳ {{ account().availableBalance | number:'1.2-2' }}</span>
        </div>
        <div class="card balance-card current">
          <span class="balance-label">Current Balance</span>
          <span class="balance-value">৳ {{ account().currentBalance | number:'1.2-2' }}</span>
        </div>
        <div class="card balance-card hold">
          <span class="balance-label">Hold Balance</span>
          <span class="balance-value">৳ {{ account().holdBalance | number:'1.2-2' }}</span>
        </div>
      </div>

      <div class="two-col">
        <div class="card">
          <h3 class="card-title">Account Information</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Branch Name</span>
              <span class="info-value">{{ account().branchName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Routing Number</span>
              <span class="info-value font-mono">{{ account().branchRoutingNumber }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Account Type</span>
              <span class="info-value">{{ account().accountType }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status</span>
              <span class="info-value"><app-status-badge [status]="account().accountStatus" /></span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Nominee</h3>
          <div class="nominee-section">
            @if (account().n_photo) {
              <div class="nominee-photo">
                <img [src]="account().n_photo" [alt]="account().n_name" />
              </div>
            } @else {
              <div class="nominee-photo placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            }
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">{{ account().n_name || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ account().n_email || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ account().n_phone || '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      @if (account().holderResponses && account().holderResponses.length > 0) {
        <div class="card">
          <h3 class="card-title">Account Holders</h3>
          <div class="table-responsive">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Holder Name</th>
                  <th>Type</th>
                  <th>Can Withdraw</th>
                  <th>Can Deposit</th>
                  <th>Can Approve</th>
                </tr>
              </thead>
              <tbody>
                @for (h of account().holderResponses; track h.id) {
                  <tr>
                    <td class="fw-semibold">{{ h.accountHolderName }}</td>
                    <td>{{ h.holderType }}</td>
                    <td>
                      <span class="perm-dot" [class.active]="h.canWithdraw" [class.inactive]="!h.canWithdraw"></span>
                    </td>
                    <td>
                      <span class="perm-dot" [class.active]="h.canDeposit" [class.inactive]="!h.canDeposit"></span>
                    </td>
                    <td>
                      <span class="perm-dot" [class.active]="h.canApproveTransaction" [class.inactive]="!h.canApproveTransaction"></span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <div class="card">
        <div class="card-header-row">
          <h3 class="card-title mb-0">Recent Transactions</h3>
          <a [routerLink]="['/transactions']" class="btn btn-sm btn-outline-primary">View Full Transactions</a>
        </div>
        @if (transactions().length === 0) {
          <p class="text-muted text-center py-4">No transactions found.</p>
        } @else {
          <div class="table-responsive">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Sender / Receiver</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Direction</th>
                </tr>
              </thead>
              <tbody>
                @for (t of transactions(); track t.id) {
                  <tr>
                    <td class="font-mono fw-semibold">{{ t.transactionId }}</td>
                    <td>
                      @if (t.direction === 'INCOMING') {
                        <span class="text-muted">From:</span> {{ t.senderName }} <span class="text-muted font-mono">({{ t.senderAccountNumber }})</span>
                      } @else {
                        <span class="text-muted">To:</span> {{ t.receiverName }} <span class="text-muted font-mono">({{ t.receiverAccountNumber }})</span>
                      }
                    </td>
                    <td class="fw-bold" [class.text-success]="t.direction === 'INCOMING'" [class.text-danger]="t.direction === 'OUTGOING'">
                      {{ t.direction === 'INCOMING' ? '+' : '-' }} ৳ {{ t.response?.amount | number:'1.2-2' }}
                    </td>
                    <td>
                      <app-status-badge [status]="t.response?.status || 'PENDING'" />
                    </td>
                    <td>
                      <span class="direction-badge" [class.incoming]="t.direction === 'INCOMING'" [class.outgoing]="t.direction === 'OUTGOING'">
                        {{ t.direction }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748B;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 20px;
      transition: color 0.15s;
    }
    .back-link:hover { color: #1E293B; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .account-number {
      font-size: 26px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .type-badge {
      background: #EEF2FF;
      color: #3730A3;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .status-select {
      padding: 8px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #334155;
      background: #fff;
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s;
    }
    .status-select:focus { border-color: #6366F1; }

    .balance-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .balance-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 24px;
      border-radius: 12px;
    }
    .balance-card.available { background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); color: #fff; }
    .balance-card.current { background: linear-gradient(135deg, #4338CA 0%, #6366F1 100%); color: #fff; }
    .balance-card.hold { background: linear-gradient(135deg, #C2410C 0%, #F97316 100%); color: #fff; }
    .balance-label { font-size: 12px; font-weight: 500; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.5px; }
    .balance-value { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .card {
      background: #fff;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #0F172A;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .info-grid { display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-label { font-size: 13px; color: #64748B; }
    .info-value { font-size: 13px; font-weight: 600; color: #1E293B; }

    .nominee-section { display: flex; align-items: center; gap: 20px; }
    .nominee-photo {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nominee-photo img { width: 100%; height: 100%; object-fit: cover; }
    .nominee-photo.placeholder { border: 2px dashed #CBD5E1; }

    .table { width: 100%; border-collapse: collapse; }
    .table th {
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      border-bottom: 1px solid #E2E8F0;
    }
    .table td {
      padding: 12px;
      font-size: 13px;
      color: #334155;
      border-bottom: 1px solid #F1F5F9;
    }
    .table tbody tr:hover { background: #F8FAFC; }
    .font-mono { font-family: 'SF Mono', 'Consolas', monospace; font-size: 12px; }

    .perm-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .perm-dot.active { background: #10B981; }
    .perm-dot.inactive { background: #E2E8F0; }

    .direction-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .direction-badge.incoming { background: #D1FAE5; color: #065F46; }
    .direction-badge.outgoing { background: #FEE2E2; color: #991B1B; }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .skeleton { background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
    .skeleton-line.lg { height: 20px; width: 60%; }
    .skeleton-header { height: 36px; width: 300px; margin-bottom: 28px; border-radius: 6px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skeleton-card { height: 100px; padding: 24px; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 768px) {
      .balance-grid { grid-template-columns: 1fr; }
      .two-col { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 16px; }
    }
  `]
})
export class AccountDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  accountNumber = signal<string>('');
  account = signal<any>(null);
  transactions = signal<any[]>([]);
  loading = signal(true);
  selectedStatus = '';

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('accountNumber');
    if (param) {
      this.accountNumber.set(param);
      this.fetchData(param);
    } else {
      this.loading.set(false);
    }
  }

  private fetchData(accNum: string) {
    this.http.get<any>(`${environment.apiUrl}/account/account-number/${accNum}`).subscribe({
      next: (data) => {
        this.account.set(data);
        this.selectedStatus = data.accountStatus;
        this.fetchTransactions(accNum);
      },
      error: () => this.loading.set(false),
    });
  }

  private fetchTransactions(accNum: string) {
    this.http.get<any[]>(`${environment.apiUrl}/account-transaction/accountNumber/${accNum}`).subscribe({
      next: (data) => {
        this.transactions.set(data.slice(0, 10));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeStatus(status: string) {
    if (!this.account() || !status) return;
    this.http.patch<any>(`${environment.apiUrl}/account/${this.account().id}/status/${status}`, {}).subscribe({
      next: (updated) => {
        this.account.set(updated);
        this.selectedStatus = updated.accountStatus;
      },
      error: () => {
        this.selectedStatus = this.account().accountStatus;
      },
    });
  }
}
