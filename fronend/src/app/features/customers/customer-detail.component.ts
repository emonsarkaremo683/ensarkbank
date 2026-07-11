import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DecimalPipe, DatePipe],
  template: `
    @if (loading()) {
      <div class="detail-skeleton">
        <div class="skeleton-back"></div>
        <div class="skeleton-header"></div>
        <div class="skeleton-cards">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      </div>
    } @else if (customer()) {
      <a routerLink="/customers" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Customers
      </a>

      <div class="profile-header">
        <div class="profile-avatar">
          @if (customer().profile) {
            <img [src]="customer().profile" alt="Profile" />
          } @else {
            <div class="avatar-placeholder">
              {{ customer().name?.charAt(0) || '?' }}
            </div>
          }
        </div>
        <div class="profile-info">
          <h1>{{ customer().name }}</h1>
          <p class="text-muted">{{ customer().email }}</p>
          <div class="profile-badges">
            <app-status-badge [status]="customer().active ? 'ACTIVE' : 'INACTIVE'" />
            @if (customer().emailVerified) {
              <span class="badge badge-verified">EMAIL VERIFIED</span>
            } @else {
              <span class="badge badge-unverified">EMAIL UNVERIFIED</span>
            }
          </div>
        </div>
        <div class="profile-actions">
          <a [routerLink]="['/customers', customerId(), 'edit']" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </a>
          <button class="btn" [class]="customer().active ? 'btn-danger-outline' : 'btn-success-outline'" (click)="toggleActive()">
            @if (customer().active) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              Deactivate
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Activate
            }
          </button>
        </div>
      </div>

      <div class="info-grid">
        <div class="card info-card">
          <div class="card-header">
            <h3>Personal Information</h3>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value fw-semibold">{{ customer().name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ customer().email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ customer().phone || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Gender</span>
              <span class="info-value">{{ customer().gender || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Occupation</span>
              <span class="info-value">{{ customer().occupation || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date of Birth</span>
              <span class="info-value">{{ customer().dob | date:'mediumDate' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Role</span>
              <span class="info-value"><span class="badge badge-role">{{ customer().role }}</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">Email Verified</span>
              <span class="info-value">
                @if (customer().emailVerified) {
                  <span class="text-success fw-semibold">Yes</span>
                } @else {
                  <span class="text-muted">No</span>
                }
              </span>
            </div>
          </div>
        </div>

        <div class="card info-card">
          <div class="card-header">
            <h3>Addresses</h3>
          </div>
          <div class="card-body">
            @if (customer().addresses && customer().addresses.length > 0) {
              @for (addr of customer().addresses; track addr.area) {
                <div class="address-block">
                  <div class="address-type-badge">
                    @if (addr.addressType === 'PERMANENT') {
                      <span class="badge badge-permanent">PERMANENT</span>
                    } @else {
                      <span class="badge badge-present">PRESENT</span>
                    }
                  </div>
                  <div class="address-details">
                    @if (addr.holdingNo) {
                      <p>{{ addr.holdingNo }}</p>
                    }
                    <p>{{ addr.area }}</p>
                    @if (addr.policeStationName) {
                      <p class="text-muted">{{ addr.policeStationName }}</p>
                    }
                    @if (addr.postalCode) {
                      <p class="text-muted">Postal: {{ addr.postalCode }}</p>
                    }
                  </div>
                </div>
              }
            } @else {
              <p class="text-muted text-center py-3">No addresses on file</p>
            }
          </div>
        </div>
      </div>

      <div class="card section-card">
        <div class="card-header">
          <h3>KYC Documents</h3>
        </div>
        <div class="card-body">
          @if (customer().documents && customer().documents.length > 0) {
            <div class="documents-grid">
              @for (doc of customer().documents; track doc.path) {
                <div class="document-item">
                  <div class="doc-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <div class="doc-info">
                    <span class="doc-type fw-semibold">{{ doc.doc_type }}</span>
                    <a [href]="doc.path" target="_blank" rel="noopener" class="doc-link">View Document</a>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-muted text-center py-3">No documents uploaded</p>
          }
        </div>
      </div>

      <div class="card section-card">
        <div class="card-header">
          <h3>Linked Accounts</h3>
        </div>
        <div class="card-body">
          @if (accountsLoading()) {
            <div class="text-center py-4">
              <div class="spinner"></div>
            </div>
          } @else if (accounts().length === 0) {
            <p class="text-muted text-center py-3">No linked accounts</p>
          } @else {
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Account Number</th>
                    <th>Type</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of accounts(); track a.id) {
                    <tr style="cursor: pointer" [routerLink]="['/accounts', a.id]">
                      <td class="font-mono fw-semibold">{{ a.accountNumber }}</td>
                      <td>{{ a.accountType }}</td>
                      <td class="fw-bold">{{ a.balance | number:'1.2-2' }}</td>
                      <td><app-status-badge [status]="a.status" /></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="text-center py-5">
        <p class="text-muted">Customer not found</p>
        <a routerLink="/customers" class="btn btn-primary mt-3">Back to Customers</a>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748B;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 24px;
      transition: color 0.15s;
    }
    .back-link:hover { color: #1E40AF; }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 32px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      margin-bottom: 24px;
    }

    .profile-avatar { flex-shrink: 0; }
    .profile-avatar img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }
    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
    }

    .profile-info { flex: 1; }
    .profile-info h1 { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: #0F172A; }
    .profile-info p { margin: 0 0 10px; font-size: 14px; }
    .profile-badges { display: flex; gap: 8px; }

    .badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .badge-verified { background: #D1FAE5; color: #065F46; }
    .badge-unverified { background: #FEE2E2; color: #991B1B; }
    .badge-role { background: #DBEAFE; color: #1E40AF; }
    .badge-permanent { background: #DBEAFE; color: #1E40AF; }
    .badge-present { background: #FEF3C7; color: #92400E; }

    .profile-actions { display: flex; gap: 10px; flex-shrink: 0; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .btn-primary { background: #2563EB; color: #fff; }
    .btn-primary:hover { background: #1D4ED8; }
    .btn-danger-outline { background: #fff; color: #DC2626; border: 1px solid #FECACA; }
    .btn-danger-outline:hover { background: #FEF2F2; }
    .btn-success-outline { background: #fff; color: #059669; border: 1px solid #A7F3D0; }
    .btn-success-outline:hover { background: #ECFDF5; }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      overflow: hidden;
    }
    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid #F1F5F9;
    }
    .card-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #0F172A; }
    .card-body { padding: 20px 24px; }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #F8FAFC;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: #64748B; }
    .info-value { font-size: 14px; color: #0F172A; text-align: right; }

    .address-block {
      padding: 16px;
      background: #F8FAFC;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    .address-block:last-child { margin-bottom: 0; }
    .address-type-badge { margin-bottom: 8px; }
    .address-details p { margin: 2px 0; font-size: 14px; color: #334155; }
    .text-muted { color: #94A3B8 !important; }
    .text-success { color: #059669 !important; }
    .fw-semibold { font-weight: 600; }
    .fw-bold { font-weight: 700; }

    .section-card { margin-bottom: 24px; }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .document-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #F8FAFC;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }
    .doc-icon { color: #64748B; flex-shrink: 0; }
    .doc-type { display: block; font-size: 13px; color: #0F172A; }
    .doc-link {
      display: block;
      font-size: 12px;
      color: #2563EB;
      text-decoration: none;
      margin-top: 2px;
    }
    .doc-link:hover { text-decoration: underline; }

    .table { width: 100%; }
    .table th {
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 12px 16px;
      border-bottom: 1px solid #E2E8F0;
    }
    .table td {
      padding: 12px 16px;
      font-size: 14px;
      color: #334155;
      border-bottom: 1px solid #F1F5F9;
      vertical-align: middle;
    }
    .table tbody tr:hover { background: #F8FAFC; }
    .font-mono { font-size: 13px; font-family: 'SF Mono', 'Fira Code', monospace; }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #E2E8F0;
      border-top-color: #2563EB;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .detail-skeleton { padding-top: 0; }
    .skeleton-back {
      width: 140px;
      height: 16px;
      background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 24px;
    }
    .skeleton-header {
      height: 140px;
      background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .skeleton-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .skeleton-card {
      height: 300px;
      background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 12px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `]
})
export class CustomerDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  customerId = signal<number>(0);
  customer = signal<any>(null);
  accounts = signal<any[]>([]);
  loading = signal(true);
  accountsLoading = signal(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.customerId.set(id);
      this.fetchCustomer(id);
      this.fetchAccounts(id);
    });
  }

  fetchCustomer(id: number) {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/customer/${id}`).subscribe({
      next: (data) => { this.customer.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  fetchAccounts(id: number) {
    this.accountsLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/customer/customer/${id}`).subscribe({
      next: (data) => { this.accounts.set(data); this.accountsLoading.set(false); },
      error: () => this.accountsLoading.set(false),
    });
  }

  toggleActive() {
    const c = this.customer();
    if (!c) return;
    this.customer.set({ ...c, active: !c.active });
  }
}
