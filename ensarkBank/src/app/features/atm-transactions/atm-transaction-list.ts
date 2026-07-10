import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AtmTransactionService, AtmService } from '../../services';
import {
  ATMTransactionResponse,
  getTransactionStatusClass,
  getTxTypeColor,
  ATMResponse,
} from '../../models';

@Component({
  selector: 'app-atm-transaction-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './atm-transaction-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './atm-transaction-list.scss',
})
export class AtmTransactionList implements OnInit {
  private atmTxService = inject(AtmTransactionService);
  private atmService = inject(AtmService);

  transactions = signal<ATMTransactionResponse[]>([]);
  atms = signal<ATMResponse[]>([]);
  selectedAtm = signal<number | null>(null);
  loading = signal(true);
  error = signal('');

  getStatusClass = getTransactionStatusClass;
  getTypeColor = getTxTypeColor;

  ngOnInit() {
    this.atmService.getAll().subscribe({
      next: (data) => this.atms.set(data),
      error: () => {},
    });
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set('');
    this.atmTxService.getAll().subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  filterByAtm(atmId: number | null) {
    this.selectedAtm.set(atmId);
    if (atmId === null) {
      this.loadAll();
      return;
    }
    this.loading.set(true);
    this.atmTxService.getByAtmId(atmId).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
