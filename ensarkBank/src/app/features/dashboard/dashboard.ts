import { Component, OnInit, inject, signal } from '@angular/core';
import { BranchService } from '../../services';
import { CustomerService } from '../../services';
import { AccountService } from '../../services';
import { CardService } from '../../services';
import { TransactionService } from '../../services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private branchService = inject(BranchService);
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);

  stats = signal([
    { label: 'Total Branches', value: 0, icon: '🏦', color: '#667eea' },
    { label: 'Total Customers', value: 0, icon: '👤', color: '#f093fb' },
    { label: 'Total Accounts', value: 0, icon: '💳', color: '#4facfe' },
    { label: 'Total Cards', value: 0, icon: '🃏', color: '#43e97b' },
    { label: 'Total Transactions', value: 0, icon: '💸', color: '#fa709a' },
  ]);

  loading = signal(true);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.branchService.getAll().subscribe({
      next: (data) => this.stats.update(s => { s[0].value = data.length; return [...s]; }),
      error: () => {}
    });
    this.customerService.getAll().subscribe({
      next: (data) => this.stats.update(s => { s[1].value = data.length; return [...s]; }),
      error: () => {}
    });
    this.accountService.getAll().subscribe({
      next: (data) => this.stats.update(s => { s[2].value = data.length; return [...s]; }),
      error: () => {}
    });
    this.cardService.getAll().subscribe({
      next: (data) => this.stats.update(s => { s[3].value = data.length; return [...s]; }),
      error: () => {}
    });
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.stats.update(s => { s[4].value = data.length; return [...s]; });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
