import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services';
import { AccountTransactionResponse } from '../../models';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.scss'
})
export class TransactionDetail implements OnInit {
  private transactionService = inject(TransactionService);
  private route = inject(ActivatedRoute);

  transaction = signal<AccountTransactionResponse | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransaction(+id);
    }
  }

  loadTransaction(id: number) {
    this.loading.set(true);
    this.transactionService.getById(id).subscribe({
      next: (data) => { this.transaction.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'badge-green';
      case 'FAILED': return 'badge-red';
      case 'PENDING': return 'badge-yellow';
      case 'CANCELLED': return 'badge-red';
      case 'REVERSED': return 'badge-yellow';
      default: return 'badge-light';
    }
  }
}
