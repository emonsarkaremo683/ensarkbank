import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AccountService } from '../../services';
import { TransactionService } from '../../services';
import { AccountResponse, AccountTransactionResponse } from '../../models';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.scss'
})
export class AccountDetail implements OnInit {
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef)

  account = signal<AccountResponse | null>(null);
  transactions = signal<AccountTransactionResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(+id);
    }
  }

  loadAccount(id: number) {
    this.loading.set(true);
    this.accountService.getById(id).subscribe({
      next: (data) => {
        this.account.set(data);
        this.loadTransactions(data.accountNumber);
      },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadTransactions(accountNumber: string) {
    this.transactionService.getByAccountNumber(accountNumber).subscribe({
      next: (data) => { this.transactions.set(data); this.cdr.markForCheck(); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-green';
      case 'PENDING': return 'badge-yellow';
      case 'BLOCKED':
      case 'CLOSED': return 'badge-red';
      default: return 'badge-light';
    }
  }

  getTxStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'badge-green';
      case 'FAILED': return 'badge-red';
      case 'PENDING': return 'badge-yellow';
      default: return 'badge-light';
    }
  }
}
