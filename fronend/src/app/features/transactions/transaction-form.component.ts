import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>New Transaction</h1>
        <p>Create a new account transaction</p>
      </div>
      <a routerLink="/transactions" class="btn btn-outline-secondary">← Back</a>
    </div>

    <div class="card">
      <div class="card-body">
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        @if (success()) {
          <div class="alert alert-success">Transaction created successfully!</div>
        }

        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Transaction Type</label>
            <select class="form-select" [(ngModel)]="formData.transactionType">
              <option value="TRANSFER">TRANSFER</option>
              <option value="DEPOSIT">DEPOSIT</option>
              <option value="WITHDRAW">WITHDRAW</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="REFUND">REFUND</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Channel</label>
            <select class="form-select" [(ngModel)]="formData.channel">
              <option value="INTERNET_BANKING">INTERNET BANKING</option>
              <option value="MOBILE_BANKING">MOBILE BANKING</option>
              <option value="BRANCH">BRANCH</option>
              <option value="ATM">ATM</option>
              <option value="POS">POS</option>
            </select>
          </div>

          <div class="col-md-12">
            <label class="form-label">Sender Account</label>
            <select class="form-select" [(ngModel)]="formData.senderId">
              <option value="">Select sender account</option>
              @for (account of accounts(); track account.id) {
                <option [value]="account.id">{{ account.accountNumber }} — {{ account.customerName || account.name || 'Account ' + account.id }}</option>
              }
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Receiver Account Number</label>
            <input type="text" class="form-control" placeholder="Enter receiver account number" [(ngModel)]="formData.receiverAccountNumber" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Receiver Name</label>
            <input type="text" class="form-control" placeholder="Enter receiver name" [(ngModel)]="formData.receiverName" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Bank Name</label>
            <input type="text" class="form-control" placeholder="Enter bank name" [(ngModel)]="formData.bankName" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Amount</label>
            <div class="input-group">
              <span class="input-group-text">৳</span>
              <input type="number" class="form-control" placeholder="0.00" min="0" step="0.01" [(ngModel)]="formData.amount" />
            </div>
          </div>

          <div class="col-md-12">
            <label class="form-label">Remarks</label>
            <textarea class="form-control" rows="3" placeholder="Enter transaction remarks" [(ngModel)]="formData.remarks"></textarea>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <a routerLink="/transactions" class="btn btn-outline-secondary">Cancel</a>
          <button class="btn btn-primary" [disabled]="submitting()" (click)="submit()">
            @if (submitting()) {
              <span class="spinner-border spinner-border-sm me-1"></span>
            }
            Submit Transaction
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-label { font-weight: 500; font-size: 13px; color: #475569; }
    .form-control, .form-select { border-radius: 8px; padding: 10px 14px; border: 1px solid #E2E8F0; }
    .form-control:focus, .form-select:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .input-group-text { border-radius: 8px 0 0 8px; background: #F8FAFC; border: 1px solid #E2E8F0; font-weight: 500; }
    .btn { border-radius: 8px; padding: 10px 20px; font-weight: 500; }
    .alert { border-radius: 8px; font-size: 14px; }
  `]
})
export class TransactionFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  accounts = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');
  success = signal(false);

  formData = {
    senderId: '',
    receiverAccountNumber: '',
    receiverName: '',
    bankName: '',
    transactionType: 'TRANSFER',
    channel: 'INTERNET_BANKING',
    amount: null as number | null,
    remarks: '',
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/account/all/`).subscribe({
      next: (data) => this.accounts.set(data),
      error: () => {},
    });
  }

  submit() {
    if (!this.formData.senderId || !this.formData.amount || this.formData.amount <= 0) {
      this.error.set('Please fill in all required fields (Sender Account and Amount).');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    const payload = {
      senderId: Number(this.formData.senderId),
      receiverAccountNumber: this.formData.receiverAccountNumber || null,
      receiverName: this.formData.receiverName || null,
      bankName: this.formData.bankName || null,
      beneficiaryId: null,
      request: {
        transactionType: this.formData.transactionType,
        channel: this.formData.channel,
        amount: this.formData.amount,
        remarks: this.formData.remarks || null,
      },
    };

    this.http.post(`${environment.apiUrl}/account-transaction/`, payload).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/transactions']), 1500);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create transaction. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
