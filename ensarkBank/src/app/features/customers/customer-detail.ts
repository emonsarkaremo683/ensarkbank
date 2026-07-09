import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CustomerService, AccountService, ToastService } from '../../services';
import { CustomerResponse, AccountResponse } from '../../models';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.scss'
})
export class CustomerDetail implements OnInit {
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  customer = signal<CustomerResponse | null>(null);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  error = signal('');
  success = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCustomer(+id);
    }
  }

  loadCustomer(id: number) {
    this.loading.set(true);
    this.customerService.getById(id).subscribe({
      next: (data) => {
        this.customer.set(data);
        console.log(data);
        this.loadAccounts(id);
      },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadAccounts(customerId: number) {
    this.customerService.getAccountsByCustomerId(customerId).subscribe({
      next: (data) => { this.accounts.set(data);
   
        this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  updateKycStatus(status: string) {
    const id = this.customer()?.id;
    if (!id) return;
    this.customerService.updateKycStatus(id, status).subscribe({
      next: (data) => {
        this.customer.set(data);
        this.success.set(`KYC status updated to ${status}`);
        this.toast.success(`KYC status updated to ${status}`);
      },
      error: (err) => {
        this.error.set(err.message);
        this.toast.error(err.message);
      }
    });
  }

  getKycStatusClass(status: string): string {
    switch (status) {
      case 'VERIFIED': return 'badge-green';
      case 'PENDING': return 'badge-yellow';
      case 'UNDER_REVIEW': return 'badge-blue';
      case 'REJECTED': return 'badge-red';
      case 'EXPIRED': return 'badge-light';
      default: return 'badge-light';
    }
  }

  getStatusClass(active: boolean): string {
    return active ? 'badge-green' : 'badge-red';
  }
}
