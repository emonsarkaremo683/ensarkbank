import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AtmTransactionService } from '../../services';
import { ATMTransactionResponse, getTransactionStatusClass, getTxTypeColor } from '../../models';

@Component({
  selector: 'app-atm-transaction-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './atm-transaction-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './atm-transaction-detail.scss',
})
export class AtmTransactionDetail implements OnInit {
  private atmTxService = inject(AtmTransactionService);
  private route = inject(ActivatedRoute);

  transaction = signal<ATMTransactionResponse | null>(null);
  loading = signal(true);
  error = signal('');

  getStatusClass = getTransactionStatusClass;
  getTypeColor = getTxTypeColor;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.atmTxService.getById(+id).subscribe({
      next: (data) => {
        this.transaction.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
