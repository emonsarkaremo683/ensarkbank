import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CashierTransactionService } from '../../services';
import { CashierTransactionResponse } from '../../models';

@Component({
  selector: 'app-cashier-transaction-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cashier-transaction-list.html',
  styleUrl: './cashier-transaction-list.scss'
})
export class CashierTransactionList implements OnInit {
  private cashierTxService = inject(CashierTransactionService);
  transactions = signal<CashierTransactionResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading.set(true);
    this.cashierTxService.getAll().subscribe({
      next: (data) => { this.transactions.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  deleteTransaction(id: number) {
    if (confirm('Are you sure you want to delete this cashier transaction?')) {
      this.cashierTxService.delete(id).subscribe({
        next: () => this.loadTransactions(),
        error: (err) => this.error.set(err.message)
      });
    }
  }
}
