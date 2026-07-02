import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services';
import { AccountService } from '../../services';
import { BeneficiaryService } from '../../services';
import { AccountTransactionRequest, AccountResponse, BeneficiaryResponse } from '../../models';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss'
})
export class TransactionForm implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private beneficiaryService = inject(BeneficiaryService);
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
      remarks: ''
    }
  };

  accounts = signal<AccountResponse[]>([]);
  beneficiaries = signal<BeneficiaryResponse[]>([]);
  loading = signal(false);
  error = signal('');
  success = signal('');

  channels = ['BRANCH', 'ATM', 'INTERNET_BANKING', 'MOBILE_BANKING', 'POS', 'E_COMMERCE', 'BEFTN', 'NPSB', 'RTGS'];

  ngOnInit() {
    this.accountService.getAll().subscribe({ next: (data) => this.accounts.set(data) });
    this.beneficiaryService.getAll().subscribe({ next: (data) => this.beneficiaries.set(data) });
  }

  onBeneficiarySelect(beneficiaryId: number) {
    const ben = this.beneficiaries().find(b => b.accNumber === String(beneficiaryId));
    if (ben) {
      this.transfer.receiverAccountNumber = ben.accNumber;
      this.transfer.receiverName = ben.name;
    }
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
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
