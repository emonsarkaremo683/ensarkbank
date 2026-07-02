import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services';
import { AccountTransactionResponse } from '../../models';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss'
})
export class TransactionList implements OnInit {
  private transactionService = inject(TransactionService);
  transactions = signal<AccountTransactionResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading.set(true);
    this.transactionService.getAll().subscribe({
      next: (data) => { this.transactions.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
