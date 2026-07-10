import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AtmTransactionService, AtmService } from '../../services';
import {
  ATMTransactionResponse,
  ATMResponse,
  ATM_TRANSACTION_TYPES,
  ATMTransactionType,
} from '../../models';

@Component({
  selector: 'app-atm-transaction-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './atm-transaction-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './atm-transaction-form.scss',
})
export class AtmTransactionForm implements OnInit {
  private atmTxService = inject(AtmTransactionService);
  private atmService = inject(AtmService);
  private router = inject(Router);

  atms = signal<ATMResponse[]>([]);
  txTypes = ATM_TRANSACTION_TYPES;

  selectedType = signal<ATMTransactionType | null>(null);
  atmId = signal<number | null>(null);
  cardNumber = signal('');
  pin = signal('');
  amountStr = signal('');
  remarks = signal('');

  loading = signal(false);
  error = signal('');
  receipt = signal<ATMTransactionResponse | null>(null);

  mode = signal<'txn' | 'balance'>('txn');
  balance = signal<number | null>(null);
  balanceLoading = signal(false);

  ngOnInit() {
    this.atmService.getAll().subscribe({
      next: (data) => this.atms.set(data.filter((a) => a.status === 'ACTIVE')),
      error: () => {},
    });
  }

  get amount(): number {
    return parseFloat(this.amountStr().replace(/,/g, '')) || 0;
  }

  selectType(t: ATMTransactionType) {
    this.mode.set('txn');
    this.selectedType.set(t);
    this.error.set('');
    this.balance.set(null);
  }

  selectBalanceMode() {
    if (!this.canInquireBalance) return;
    this.mode.set('balance');
    this.selectedType.set(null);
    this.error.set('');
    this.balance.set(null);
    this.inquireBalance();
  }

  exitBalanceMode() {
    this.mode.set('txn');
    this.selectedType.set(null);
    this.balance.set(null);
    this.error.set('');
  }

  get canInquireBalance(): boolean {
    return this.cardNumber().length > 0 && this.pin().length > 0;
  }

  inquireBalance() {
    if (!this.canInquireBalance) {
      this.error.set('Enter card number and PIN to check balance');
      return;
    }
    this.balanceLoading.set(true);
    this.error.set('');
    this.balance.set(null);
    this.atmTxService.checkBalance(this.cardNumber(), this.pin()).subscribe({
      next: (b) => {
        this.balance.set(b);
        this.balanceLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.balanceLoading.set(false);
      },
    });
  }

  selectAtm(id: number) {
    this.atmId.set(id);
  }

  onAtmChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.atmId.set(value ? +value : null);
  }

  onCardInput(event: Event) {
    this.cardNumber.set((event.target as HTMLInputElement).value);
  }

  onPinInput(event: Event) {
    this.pin.set((event.target as HTMLInputElement).value);
  }

  onRemarksInput(event: Event) {
    this.remarks.set((event.target as HTMLInputElement).value);
  }

  pressKey(key: string) {
    let current = this.amountStr().replace(/,/g, '');
    if (key === 'clear') {
      this.amountStr.set('');
      return;
    }
    if (key === 'back') {
      this.amountStr.set(current.slice(0, -1));
      return;
    }
    if (current === '0') current = '';
    const next = current + key;
    if (!/^\d*\.?\d{0,2}$/.test(next)) return;
    this.amountStr.set(next);
  }

  setQuick(amount: number) {
    this.amountStr.set(amount.toString());
  }

  get needsCard(): boolean {
    return this.selectedType() !== 'REFILL';
  }

  get canSubmit(): boolean {
    const hasType = !!this.selectedType();
    const hasAtm = !!this.atmId();
    const hasAmount = this.amount > 0;
    const hasCard = this.needsCard ? this.cardNumber().length > 0 && this.pin().length > 0 : true;
    return hasType && hasAtm && hasAmount && hasCard && !this.loading();
  }

  submit() {
    if (!this.canSubmit) return;
    this.loading.set(true);
    this.error.set('');

    const type = this.selectedType()!;
    const atmId = this.atmId()!;
    const amount = this.amount;
    const remarks = this.remarks() || this.txTypes.find((t) => t.value === type)?.label;

    if (type === 'REFILL') {
      this.atmTxService.refill({ atmId, amount }).subscribe({
        next: (res) => this.onSuccess(res),
        error: (err) => this.onError(err),
      });
      return;
    }

    this.atmTxService
      .transact({
        atmId,
        cardNumber: this.cardNumber(),
        pin: this.pin(),
        transactionType: type,
        transactionRequest: {
          transactionType:
            type === 'CASH_WITHDRAW' ? ('ATM_WITHDRAW' as any) : ('ATM_DEPOSIT' as any),
          channel: 'ATM' as any,
          amount,
          remarks,
        },
      })
      .subscribe({
        next: (res) => this.onSuccess(res),
        error: (err) => this.onError(err),
      });
  }

  private onSuccess(res: ATMTransactionResponse) {
    this.loading.set(false);
    this.receipt.set(res);
  }

  private onError(err: any) {
    this.loading.set(false);
    this.error.set(err.message || 'Transaction failed');
  }

  reset() {
    this.receipt.set(null);
    this.selectedType.set(null);
    this.atmId.set(null);
    this.cardNumber.set('');
    this.pin.set('');
    this.amountStr.set('');
    this.remarks.set('');
    this.error.set('');
    this.mode.set('txn');
    this.balance.set(null);
  }
}
