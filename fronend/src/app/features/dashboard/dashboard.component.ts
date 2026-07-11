import { Component, inject } from '@angular/core';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/role';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back, {{ userName() }}</p>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <app-stat-card label="Total Accounts" value="12,845" icon="&#128179;" iconBg="rgba(37,99,235,0.1)" />
      </div>
      <div class="col-md-3">
        <app-stat-card label="Total Customers" value="8,291" icon="&#128101;" iconBg="rgba(5,150,105,0.1)" />
      </div>
      <div class="col-md-3">
        <app-stat-card label="Active Loans" value="342" icon="&#127974;" iconBg="rgba(217,119,6,0.1)" />
      </div>
      <div class="col-md-3">
        <app-stat-card label="Today's Transactions" value="1,256" icon="&#128200;" iconBg="rgba(124,58,237,0.1)" />
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Recent Transactions</h5>
          </div>
          <div class="card-body p-0">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="font-mono">TXN-001234</span></td>
                  <td><span class="badge bg-success-subtle" style="color:#065F46;background:#D1FAE5;">DEPOSIT</span></td>
                  <td class="fw-bold">৳ 25,000.00</td>
                  <td><span class="badge" style="color:#065F46;background:#D1FAE5;">SUCCESS</span></td>
                  <td class="text-muted">2026-07-11 14:30</td>
                </tr>
                <tr>
                  <td><span class="font-mono">TXN-001233</span></td>
                  <td><span class="badge" style="color:#92400E;background:#FEF3C7;">TRANSFER</span></td>
                  <td class="fw-bold">৳ 15,500.00</td>
                  <td><span class="badge" style="color:#065F46;background:#D1FAE5;">SUCCESS</span></td>
                  <td class="text-muted">2026-07-11 13:15</td>
                </tr>
                <tr>
                  <td><span class="font-mono">TXN-001232</span></td>
                  <td><span class="badge" style="color:#991B1B;background:#FEE2E2;">WITHDRAW</span></td>
                  <td class="fw-bold">৳ 8,000.00</td>
                  <td><span class="badge" style="color:#92400E;background:#FEF3C7;">PENDING</span></td>
                  <td class="text-muted">2026-07-11 12:45</td>
                </tr>
                <tr>
                  <td><span class="font-mono">TXN-001231</span></td>
                  <td><span class="badge" style="color:#065F46;background:#D1FAE5;">DEPOSIT</span></td>
                  <td class="fw-bold">৳ 50,000.00</td>
                  <td><span class="badge" style="color:#065F46;background:#D1FAE5;">SUCCESS</span></td>
                  <td class="text-muted">2026-07-11 11:20</td>
                </tr>
                <tr>
                  <td><span class="font-mono">TXN-001230</span></td>
                  <td><span class="badge" style="color:#1E40AF;background:#DBEAFE;">PAYMENT</span></td>
                  <td class="fw-bold">৳ 3,200.00</td>
                  <td><span class="badge" style="color:#991B1B;background:#FEE2E2;">FAILED</span></td>
                  <td class="text-muted">2026-07-11 10:05</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-primary py-2">New Transaction</button>
              <button class="btn btn-outline-secondary py-2">View Accounts</button>
              <button class="btn btn-outline-secondary py-2">Customer Lookup</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Account Summary</h5>
          </div>
          <div class="card-body">
            <div class="summary-item">
              <span class="summary-label">Total Deposits</span>
              <span class="summary-value">৳ 45,230,000</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Loans</span>
              <span class="summary-value">৳ 12,500,000</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Active ATMs</span>
              <span class="summary-value">24 / 28</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      padding: 16px 20px; border-bottom: 1px solid var(--border);
    }
    .card-title {
      font-family: var(--font-heading); font-weight: 700; font-size: 16px;
    }
    .font-mono { font-family: 'DM Mono', monospace; font-size: 12px; }
    .summary-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border);
    }
    .summary-item:last-child { border-bottom: none; }
    .summary-label { font-size: 13px; color: var(--text-secondary); }
    .summary-value { font-family: var(--font-heading); font-weight: 700; font-size: 15px; color: var(--text-primary); }
  `]
})
export class DashboardComponent {
  private auth = inject(AuthService);

  userName(): string {
    const user = this.auth.currentUser();
    return (user as any)?.name || user?.email?.split('@')[0] || 'User';
  }
}
