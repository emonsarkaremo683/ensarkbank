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
      next: (data) => { this.transactions.set(data); 
        console.log('Loaded transactions:', data);
        this.loading.set(false); },
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

  getJournalAccountNumber(tx: CashierTransactionResponse): string {
    if (!tx.journals?.length) return '-';
    const entryType = tx.transaction?.transactionType === 'DEPOSIT' ? 'CREDIT' : 'DEBIT';
    const journal = tx.journals.find(j => j.entryType === entryType);
    return journal?.accountNumber || tx.journals[0]?.accountNumber || '-';
  }
}
