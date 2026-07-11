import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex align-items-center mb-4">
      <a routerLink="/cards" class="btn btn-outline-secondary me-3">
        <i class="bi bi-arrow-left"></i> Back
      </a>
      <div class="page-header mb-0">
        <h1>Issue New Card</h1>
        <p>Create a debit or credit card</p>
      </div>
    </div>

    <form (ngSubmit)="onSubmit()">
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Card Details</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Account</label>
              <select class="form-select" [(ngModel)]="cardData.accountId" name="accountId" required>
                <option value="">Select Account</option>
                @for (a of accounts(); track a.id) {
                  <option [value]="a.id">{{ a.accountNumber }} — {{ a.accountType }}</option>
                }
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Card Network</label>
              <select class="form-select" [(ngModel)]="cardData.cardNetwork" name="cardNetwork" required>
                <option value="">Select Network</option>
                <option value="VISA">VISA</option>
                <option value="MASTERCARD">Mastercard</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Card Type</label>
              <select class="form-select" [(ngModel)]="cardData.cardType" name="cardType" required>
                <option value="">Select Type</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">PIN</label>
              <input type="password" class="form-control" [(ngModel)]="cardData.pin" name="pin" maxlength="6" required placeholder="Enter 4-6 digit PIN" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Daily Limit (৳)</label>
              <input type="number" class="form-control" [(ngModel)]="cardData.dailyLimit" name="dailyLimit" min="0" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Monthly Limit (৳)</label>
              <input type="number" class="form-control" [(ngModel)]="cardData.monthlyLimit" name="monthlyLimit" min="0" required />
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mb-4">
        <button type="submit" class="btn btn-primary" [disabled]="submitting()">
          @if (submitting()) {
            <span class="spinner-border spinner-border-sm me-1"></span> Issuing...
          } @else {
            Issue Card
          }
        </button>
        <a routerLink="/cards" class="btn btn-outline-secondary">Cancel</a>
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
  `]
})
export class CardFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  accounts = signal<any[]>([]);
  submitting = signal(false);
  error = signal('');

  cardData = {
    accountId: '',
    cardNetwork: '',
    cardType: '',
    pin: '',
    dailyLimit: 0,
    monthlyLimit: 0,
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/account/all/`).subscribe({
      next: (data) => this.accounts.set(data),
      error: () => {},
    });
  }

  onSubmit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');

    const payload = {
      ...this.cardData,
      accountId: Number(this.cardData.accountId),
    };

    this.http.post(`${environment.apiUrl}/card/`, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/cards']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to issue card. Please check all fields.');
      },
    });
  }
}
