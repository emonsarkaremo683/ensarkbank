import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CashierTransactionService } from '../../services';
import { CashierTransactionResponse } from '../../models';

@Component({
  selector: 'app-cashier-transaction-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cashier-transaction-detail.html',
  styleUrl: './cashier-transaction-detail.scss'
})
export class CashierTransactionDetail implements OnInit {
  private cashierTxService = inject(CashierTransactionService);
  private route = inject(ActivatedRoute);

  transaction = signal<CashierTransactionResponse | null>(null);
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
    this.cashierTxService.getById(id).subscribe({
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
