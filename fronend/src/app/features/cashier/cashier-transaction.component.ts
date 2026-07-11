import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cashier-transaction',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Cashier Transaction</h1>
        <p>Process a new check-based cashier transaction</p>
      </div>
      <a routerLink="/cashier" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="card">
      <div class="card-body">
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        @if (success()) {
          <div class="alert alert-success">{{ success() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Check Number</label>
              <input type="text" class="form-control" [(ngModel)]="form.checkNo" name="checkNo" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Branch</label>
              <select class="form-select" [(ngModel)]="form.branchId" name="branchId" required>
                <option value="">Select Branch</option>
                @for (b of branches(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Account Number</label>
              <input type="text" class="form-control" [(ngModel)]="form.accountNumber" name="accountNumber"
                (blur)="onAccountBlur()" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Account Name</label>
              <input type="text" class="form-control" [(ngModel)]="form.accountName" name="accountName" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Bank Name</label>
              <input type="text" class="form-control" [(ngModel)]="form.bankName" name="bankName" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Routing Number</label>
              <input type="text" class="form-control" [(ngModel)]="form.routingNumber" name="routingNumber" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Transaction Type</label>
              <select class="form-select" [(ngModel)]="form.transactionRequest.transactionType" name="transactionType" required>
                <option value="">Select Type</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Channel</label>
              <select class="form-select" [(ngModel)]="form.transactionRequest.channel" name="channel" required>
                <option value="">Select Channel</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
                <option value="ONLINE">Online</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Amount (৳)</label>
              <input type="number" class="form-control" [(ngModel)]="form.transactionRequest.amount" name="amount" min="0" step="0.01" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Remarks</label>
              <input type="text" class="form-control" [(ngModel)]="form.transactionRequest.remarks" name="remarks" />
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{ submitting() ? 'Processing...' : 'Submit Transaction' }}
            </button>
            <a routerLink="/cashier" class="btn btn-outline-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CashierTransactionComponent implements OnInit {
  private http = inject(HttpClient);

  branches = signal<any[]>([]);
  accounts = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');
  success = signal('');

  form = {
    checkNo: '',
    branchId: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    routingNumber: '',
    transactionRequest: {
      transactionType: '',
      channel: '',
      amount: 0,
      remarks: '',
    },
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
    });
    this.http.get<any[]>(`${environment.apiUrl}/account/all/`).subscribe({
      next: (data) => this.accounts.set(data),
    });
  }

  onAccountBlur() {
    const acc = this.accounts().find((a) => a.accountNumber === this.form.accountNumber);
    if (acc) {
      this.form.accountName = acc.accountName || '';
    }
  }

  onSubmit() {
    this.error.set('');
    this.success.set('');
    this.submitting.set(true);

    this.http.post(`${environment.apiUrl}/cashier-transactions`, this.form).subscribe({
      next: () => {
        this.success.set('Transaction processed successfully.');
        this.submitting.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Transaction failed. Please try again.');
        this.submitting.set(false);
      },
    });
  }

  private resetForm() {
    this.form = {
      checkNo: '',
      branchId: '',
      accountNumber: '',
      accountName: '',
      bankName: '',
      routingNumber: '',
      transactionRequest: { transactionType: '', channel: '', amount: 0, remarks: '' },
    };
  }
}
