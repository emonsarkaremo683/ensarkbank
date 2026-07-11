import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/accounts" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>New Account</h1>
        <p>Create a new bank account</p>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()">
      <!-- Account Details -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Account Details</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Account Type</label>
              <select class="form-select" [(ngModel)]="accountData.accountType" name="accountType" required>
                <option value="">Select Type</option>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
                <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                <option value="JOINT_ACCOUNT">Joint Account</option>
                <option value="STUDENT">Student</option>
                <option value="BUSINESS">Business</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Initial Deposit (৳)</label>
              <input type="number" class="form-control" [(ngModel)]="accountData.availableBalance" name="availableBalance" min="0" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Branch</label>
              <select class="form-select" [(ngModel)]="accountData.branchId" name="branchId" required>
                <option value="">Select Branch</option>
                @for (b of branches(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Account Status</label>
              <select class="form-select" [(ngModel)]="accountData.accountStatus" name="accountStatus" required>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Nominee Info -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Nominee Info</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Nominee Name</label>
              <input type="text" class="form-control" [(ngModel)]="accountData.n_name" name="n_name" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Nominee Email</label>
              <input type="email" class="form-control" [(ngModel)]="accountData.n_email" name="n_email" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Nominee Phone</label>
              <input type="text" class="form-control" [(ngModel)]="accountData.n_phone" name="n_phone" required />
            </div>
          </div>
        </div>
      </div>

      <!-- KYC Documents -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">KYC Documents</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Photo</label>
              <input type="file" class="form-control" accept="image/*" (change)="onFileSelect($event, 'photo')" required />
              @if (photoPreview()) {
                <img [src]="photoPreview()" class="preview-img mt-2" />
              }
            </div>
            <div class="col-md-4">
              <label class="form-label">NID Front</label>
              <input type="file" class="form-control" accept="image/*" (change)="onFileSelect($event, 'nid_front')" required />
              @if (nidFrontPreview()) {
                <img [src]="nidFrontPreview()" class="preview-img mt-2" />
              }
            </div>
            <div class="col-md-4">
              <label class="form-label">NID Back</label>
              <input type="file" class="form-control" accept="image/*" (change)="onFileSelect($event, 'nid_back')" required />
              @if (nidBackPreview()) {
                <img [src]="nidBackPreview()" class="preview-img mt-2" />
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Account Holders -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Account Holders</h5>
          <button type="button" class="btn btn-sm btn-outline-primary" (click)="addHolder()">+ Add Holder</button>
        </div>
        <div class="card-body">
          @for (holder of accountHolders(); track $index) {
            <div class="holder-card p-3 mb-3 border rounded">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Holder #{{ $index + 1 }}</h6>
                @if (accountHolders().length > 1) {
                  <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeHolder($index)">Remove</button>
                }
              </div>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Customer</label>
                  <select class="form-select" [(ngModel)]="holder.customerId" [name]="'holderCustomer' + $index" required>
                    <option value="">Select Customer</option>
                    @for (c of customers(); track c.id) {
                      <option [value]="c.id">{{ c.name }} ({{ c.email }})</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Holder Type</label>
                  <select class="form-select" [(ngModel)]="holder.holderType" [name]="'holderType' + $index" required>
                    <option value="PRIMARY">Primary</option>
                    <option value="SECONDARY">Secondary</option>
                    <option value="OPTIONAL">Optional</option>
                  </select>
                </div>
                <div class="col-md-5">
                  <label class="form-label">Permissions</label>
                  <div class="d-flex gap-3 flex-wrap">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="holder.canWithdraw" [name]="'canWithdraw' + $index" />
                      <label class="form-check-label">Can Withdraw</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="holder.canDeposit" [name]="'canDeposit' + $index" />
                      <label class="form-check-label">Can Deposit</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" [(ngModel)]="holder.canApproveTransaction" [name]="'canApprove' + $index" />
                      <label class="form-check-label">Can Approve</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex gap-2 mb-4">
        <button type="submit" class="btn btn-primary" [disabled]="submitting()">
          @if (submitting()) {
            <span class="spinner-border spinner-border-sm me-1"></span> Creating...
          } @else {
            Create Account
          }
        </button>
        <a routerLink="/accounts" class="btn btn-outline-secondary">Cancel</a>
      </div>

      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }
    </form>
  `,
  styles: [`
    .page-header h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
    .page-header p { color: #6B7280; margin-bottom: 0; font-size: 0.875rem; }
    .card { border: 1px solid #E5E7EB; border-radius: 0.5rem; }
    .card-header { background: #F9FAFB; border-bottom: 1px solid #E5E7EB; padding: 0.75rem 1.25rem; }
    .card-body { padding: 1.25rem; }
    .form-label { font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem; }
    .form-control, .form-select { font-size: 0.875rem; }
    .preview-img { width: 100%; max-height: 150px; object-fit: cover; border-radius: 0.375rem; border: 1px solid #E5E7EB; }
    .holder-card { background: #F9FAFB; }
  `]
})
export class AccountFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  branches = signal<any[]>([]);
  customers = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');

  photoPreview = signal('');
  nidFrontPreview = signal('');
  nidBackPreview = signal('');

  photoFile: File | null = null;
  nidFrontFile: File | null = null;
  nidBackFile: File | null = null;

  accountData = {
    accountType: '',
    availableBalance: 0,
    branchId: '',
    accountStatus: 'ACTIVE',
    n_name: '',
    n_email: '',
    n_phone: '',
  };

  accountHolders = signal<any[]>([
    { holderType: 'PRIMARY', canWithdraw: true, canDeposit: true, canApproveTransaction: false, customerId: '' },
  ]);

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => this.branches.set(data),
      error: () => {},
    });
    this.http.get<any[]>(`${environment.apiUrl}/customer/`).subscribe({
      next: (data) => this.customers.set(data),
      error: () => {},
    });
  }

  addHolder() {
    this.accountHolders.update((h) => [
      ...h,
      { holderType: 'SECONDARY', canWithdraw: true, canDeposit: true, canApproveTransaction: false, customerId: '' },
    ]);
  }

  removeHolder(index: number) {
    this.accountHolders.update((h) => h.filter((_, i) => i !== index));
  }

  onFileSelect(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (type === 'photo') {
      this.photoFile = file;
      this.photoPreview.set(URL.createObjectURL(file));
    } else if (type === 'nid_front') {
      this.nidFrontFile = file;
      this.nidFrontPreview.set(URL.createObjectURL(file));
    } else if (type === 'nid_back') {
      this.nidBackFile = file;
      this.nidBackPreview.set(URL.createObjectURL(file));
    }
  }

  onSubmit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');

    const holders = this.accountHolders().map((h) => ({
      holderType: h.holderType,
      canWithdraw: h.canWithdraw,
      canDeposit: h.canDeposit,
      canApproveTransaction: h.canApproveTransaction,
      customerId: Number(h.customerId),
    }));

    const payload = {
      ...this.accountData,
      branchId: Number(this.accountData.branchId),
      accountHolders: holders,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (this.photoFile) formData.append('photo', this.photoFile);
    if (this.nidFrontFile) formData.append('nid_front', this.nidFrontFile);
    if (this.nidBackFile) formData.append('nid_back', this.nidBackFile);

    this.http.post(`${environment.apiUrl}/account/create`, formData).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/accounts']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to create account. Please check all fields.');
      },
    });
  }
}
