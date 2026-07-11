import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Apply for Loan</h1>
        <p>Submit a new loan application</p>
      </div>
      <a routerLink="/loans" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="row g-4">
      <div class="col-md-7">
        <div class="card">
          <div class="card-body">
            @if (error()) {
              <div class="alert alert-danger">{{ error() }}</div>
            }
            @if (success()) {
              <div class="alert alert-success">Loan application submitted successfully!</div>
            }

            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label">Account</label>
                <select class="form-select" [(ngModel)]="formData.accountId">
                  <option value="">Select account</option>
                  @for (account of accounts(); track account.id) {
                    <option [value]="account.id">{{ account.accountNumber }} — {{ account.customerName || account.name || 'Account ' + account.id }}</option>
                  }
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Principal Amount</label>
                <div class="input-group">
                  <span class="input-group-text">৳</span>
                  <input type="number" class="form-control" placeholder="0.00" min="0" step="0.01" [(ngModel)]="formData.principalAmount" (input)="calculateEmi()" />
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Annual Interest Rate</label>
                <div class="input-group">
                  <input type="number" class="form-control" placeholder="0.00" min="0" step="0.01" [(ngModel)]="formData.annualInterestRate" (input)="calculateEmi()" />
                  <span class="input-group-text">%</span>
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Tenure (Months)</label>
                <input type="number" class="form-control" placeholder="e.g. 36" min="1" [(ngModel)]="formData.tenureMonths" (input)="calculateEmi()" />
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <a routerLink="/loans" class="btn btn-outline-secondary">Cancel</a>
              <button class="btn btn-primary" [disabled]="submitting()" (click)="submit()">
                @if (submitting()) {
                  <span class="spinner-border spinner-border-sm me-1"></span>
                }
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <div class="card emi-card">
          <div class="card-body">
            <h6 class="mb-3">EMI Preview</h6>
            @if (emiPreview()) {
              <div class="emi-row">
                <span class="emi-label">Monthly EMI</span>
                <span class="emi-value text-primary">৳ {{ emiPreview()!.emi | number:'1.2-2' }}</span>
              </div>
              <div class="emi-row">
                <span class="emi-label">Total Payable</span>
                <span class="emi-value">৳ {{ emiPreview()!.total | number:'1.2-2' }}</span>
              </div>
              <div class="emi-row">
                <span class="emi-label">Total Interest</span>
                <span class="emi-value">৳ {{ emiPreview()!.interest | number:'1.2-2' }}</span>
              </div>
            } @else {
              <p class="text-muted mb-0" style="font-size: 13px;">Enter principal, interest rate, and tenure to preview EMI.</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-label { font-weight: 500; font-size: 13px; color: #475569; }
    .form-control, .form-select { border-radius: 8px; padding: 10px 14px; border: 1px solid #E2E8F0; }
    .form-control:focus, .form-select:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .input-group-text { border-radius: 8px 0 0 8px; background: #F8FAFC; border: 1px solid #E2E8F0; font-weight: 500; }
    .input-group .form-control { border-radius: 0 8px 8px 0; }
    .btn { border-radius: 8px; padding: 10px 20px; font-weight: 500; }
    .alert { border-radius: 8px; font-size: 14px; }
    .emi-card { border: 1px solid #E2E8F0; border-radius: 12px; }
    .emi-card .card-body { padding: 20px; }
    .emi-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F1F5F9; }
    .emi-row:last-child { border-bottom: none; }
    .emi-label { font-size: 13px; color: #64748B; }
    .emi-value { font-size: 15px; font-weight: 600; color: #1E293B; }
  `]
})
export class LoanFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  accounts = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');
  success = signal(false);
  emiPreview = signal<{ emi: number; total: number; interest: number } | null>(null);

  formData = {
    accountId: '',
    principalAmount: null as number | null,
    annualInterestRate: null as number | null,
    tenureMonths: null as number | null,
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/account/all/`).subscribe({
      next: (data) => this.accounts.set(data),
      error: () => {},
    });
  }

  calculateEmi() {
    const p = this.formData.principalAmount;
    const r = this.formData.annualInterestRate;
    const n = this.formData.tenureMonths;

    if (!p || !r || !n || p <= 0 || n <= 0) {
      this.emiPreview.set(null);
      return;
    }

    const monthlyRate = r / 12 / 100;
    if (monthlyRate === 0) {
      const emi = p / n;
      this.emiPreview.set({ emi, total: p, interest: 0 });
      return;
    }

    const factor = Math.pow(1 + monthlyRate, n);
    const emi = p * monthlyRate * factor / (factor - 1);
    const total = emi * n;

    this.emiPreview.set({ emi, total, interest: total - p });
  }

  submit() {
    if (!this.formData.accountId || !this.formData.principalAmount || !this.formData.tenureMonths) {
      this.error.set('Please fill in all required fields.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const payload = {
      accountId: Number(this.formData.accountId),
      principalAmount: this.formData.principalAmount,
      annualInterestRate: this.formData.annualInterestRate || 0,
      tenureMonths: this.formData.tenureMonths,
    };

    this.http.post(`${environment.apiUrl}/loans/apply`, payload).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/loans']), 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to submit loan application. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
