import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services';
import { AccountService } from '../../services';
import { AccountTransactionRequest, AccountResponse } from '../../models';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './transaction-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './transaction-form.scss',
})
export class TransactionForm implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  transfer: AccountTransactionRequest = {
    senderId: 0,
    receiverAccountNumber: '',
    receiverName: '',
    bankName: 'EnsarBank',
    request: {
      transactionType: 'TRANSFER',
      channel: 'INTERNET_BANKING',
      amount: 0,
      remarks: '',
    },
  };

  accounts = signal<AccountResponse[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');
  receiverFilter = signal('');
  showReceiverDropdown = signal(false);

  filteredAccounts = computed(() => {
    const filter = this.receiverFilter().toLowerCase();
    if (!filter) return this.accounts();
    return this.accounts().filter(
      (a) =>
        a.accountNumber.toLowerCase().includes(filter) ||
        a.holderResponses?.some((h) => h.accountHolderName.toLowerCase().includes(filter)),
    );
  });

  transactionTypes = ['TRANSFER', 'DEPOSIT', 'WITHDRAW', 'PAYMENT', 'REFUND'];
  channels = [
    'BRANCH',
    'ATM',
    'INTERNET_BANKING',
    'MOBILE_BANKING',
    'POS',
    'E_COMMERCE',
    'BEFTN',
    'NPSB',
    'RTGS',
  ];

  ngOnInit() {
    this.accountService.getAll().subscribe({ next: (data) => this.accounts.set(data) });
  }

  onReceiverInput(value: string) {
    this.receiverFilter.set(value);
    this.transfer.receiverAccountNumber = value;
    this.transfer.receiverName = '';
    this.transfer.bankName = 'EnsarBank';
    this.showReceiverDropdown.set(true);
  }

  selectReceiver(account: AccountResponse) {
    this.transfer.receiverAccountNumber = account.accountNumber;
    this.transfer.receiverName = account.holderResponses?.[0]?.accountHolderName || '';
    this.transfer.bankName = 'EnsarBank';
    this.receiverFilter.set(account.accountNumber);
    this.showReceiverDropdown.set(false);
  }

  hideReceiverDropdown() {
    setTimeout(() => this.showReceiverDropdown.set(false), 200);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.transactionService.transfer(this.transfer).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(`Transfer successful! Transaction ID: ${res.transactionId}`);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
