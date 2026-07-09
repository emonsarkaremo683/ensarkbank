import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services';
import { AccountTransactionResponse } from '../../models';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss'
})
export class TransactionList implements OnInit {
  private transactionService = inject(TransactionService);
  transactions = signal<AccountTransactionResponse[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  filterStatus = signal<string>('ALL');

  filteredTransactions = computed(() => {
    let list = this.transactions();
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(t =>
        t.transactionId?.toLowerCase().includes(term) ||
        t.senderAccountNumber?.toLowerCase().includes(term) ||
        t.receiverAccountNumber?.toLowerCase().includes(term)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(t => t.response.status === status);
    }

    return list;
  });

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

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
