import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import {
  BranchService,
  CustomerService,
  AccountService,
  CardService,
  TransactionService,
  LoanService,
} from '../../services';
import { LoanApplicationResponse } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private branchService = inject(BranchService);
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private loanService = inject(LoanService);

  stats = signal([
    { label: 'Total Branches', value: 0, icon: '🏦', color: '#667eea', route: '/branches' },
    { label: 'Total Customers', value: 0, icon: '👤', color: '#f093fb', route: '/customers' },
    { label: 'Total Accounts', value: 0, icon: '💳', color: '#4facfe', route: '/accounts' },
    { label: 'Total Cards', value: 0, icon: '🃏', color: '#43e97b', route: '/cards' },
    { label: 'Total Transactions', value: 0, icon: '💸', color: '#fa709a', route: '/transactions' },
    { label: 'Total Loans', value: 0, icon: '📋', color: '#f5576c', route: '/loans' },
  ]);

  loanStats = signal({ pending: 0, approved: 0, active: 0, totalDisbursed: 0 });
  totalBalance = signal(0);
  loading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    let loaded = 0;
    const total = 6;

    const checkDone = () => {
      loaded++;
      if (loaded >= total) this.loading.set(false);
    };

    this.branchService.getAll().subscribe({
      next: (data) => {
        this.stats.update((s) => {
          s[0].value = data.length;
          return [...s];
        });
        checkDone();
      },
      error: () => checkDone(),
    });
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.stats.update((s) => {
          s[1].value = data.length;
          return [...s];
        });
        checkDone();
      },
      error: () => checkDone(),
    });
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.stats.update((s) => {
          s[2].value = data.length;
          return [...s];
        });
        this.totalBalance.set(data.reduce((sum, a) => sum + (a.availableBalance || 0), 0));
        checkDone();
      },
      error: () => checkDone(),
    });
    this.cardService.getAll().subscribe({
      next: (data) => {
        this.stats.update((s) => {
          s[3].value = data.length;
          return [...s];
        });
        checkDone();
      },
      error: () => checkDone(),
    });
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.stats.update((s) => {
          s[4].value = data.length;
          return [...s];
        });
        checkDone();
      },
      error: () => checkDone(),
    });
    this.loanService.getAll().subscribe({
      next: (data) => {
        this.stats.update((s) => {
          s[5].value = data.length;
          return [...s];
        });
        this.loanStats.set({
          pending: data.filter((l) => l.status === 'PENDING').length,
          approved: data.filter((l) => l.status === 'APPROVED').length,
          active: data.filter((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED').length,
          totalDisbursed: data
            .filter((l) => l.status === 'DISBURSED' || l.status === 'ACTIVE')
            .reduce((sum, l) => sum + (l.principalAmount || 0), 0),
        });
        checkDone();
      },
      error: () => checkDone(),
    });
  }
}
