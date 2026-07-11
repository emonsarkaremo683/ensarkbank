import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AccountResponse, AccountTransactionRequest, AccountTransactionResponse,
  OtpInitiateResponse
} from '../../core/models';
import { TransactionType, TransactionChannel, TransactionStatus } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent, LoadingComponent
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  step = signal<'form' | 'otp' | 'result'>('form');
  transactions = signal<AccountTransactionResponse[]>([]);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);
  selectedTransaction = signal<AccountTransactionResponse | null>(null);
  showDetailModal = signal(false);

  otpData = signal<OtpInitiateResponse | null>(null);
  otpCode = '';
  transactionResult = signal<AccountTransactionResponse | null>(null);

  form = {
    senderAccountNumber: '',
    receiverAccountNumber: '',
    transactionType: '',
    channel: '',
    amount: 0,
    remarks: ''
  };

  filters = {
    type: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  columns: TableColumn[] = [
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'senderAccountNumber', label: 'Sender', sortable: true },
    { key: 'receiverAccountNumber', label: 'Receiver', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'channel', label: 'Channel', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'createdAt', label: 'Date', type: 'date', sortable: true },
  ];

  transactionTypes = Object.values(TransactionType);
  transactionChannels = Object.values(TransactionChannel);

  filteredTransactions = computed(() => {
    let result = this.transactions();
    if (this.filters.type) {
      result = result.filter(t => t.type === this.filters.type);
    }
    if (this.filters.status) {
      result = result.filter(t => t.status === this.filters.status);
    }
    if (this.filters.dateFrom) {
      const from = new Date(this.filters.dateFrom);
      result = result.filter(t => new Date(t.createdAt) >= from);
    }
    if (this.filters.dateTo) {
      const to = new Date(this.filters.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(t => new Date(t.createdAt) <= to);
    }
    return result;
  });

  totalTransactions = computed(() => this.transactions().length);
  successCount = computed(() => this.transactions().filter(t => t.status === 'SUCCESS').length);
  totalAmount = computed(() => this.transactions().reduce((s, t) => s + t.amount, 0));
  pendingCount = computed(() => this.transactions().filter(t => t.status === 'PENDING').length);

  constructor(
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getTransactions().subscribe({
      next: data => { this.transactions.set(data); this.loading.set(false); },
      error: () => { this.notify.error('Error', 'Failed to load transactions'); this.loading.set(false); }
    });
    this.api.getAccounts().subscribe({
      next: data => this.accounts.set(data),
      error: () => {}
    });
  }

  resetForm(): void {
    this.form = {
      senderAccountNumber: '', receiverAccountNumber: '',
      transactionType: '', channel: '', amount: 0, remarks: ''
    };
  }

  initiateTransaction(): void {
    if (!this.form.senderAccountNumber || !this.form.transactionType || this.form.amount <= 0) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    if (this.form.transactionType === 'TRANSFER' && !this.form.receiverAccountNumber) {
      this.notify.warning('Validation', 'Receiver account is required for transfers');
      return;
    }

    this.submitting.set(true);
    const request: AccountTransactionRequest = {
      senderAccountNumber: this.form.senderAccountNumber,
      receiverAccountNumber: this.form.receiverAccountNumber || undefined,
      transactionRequest: {
        type: this.form.transactionType as TransactionType,
        channel: (this.form.channel as TransactionChannel) || TransactionChannel.BRANCH,
        amount: this.form.amount,
        remarks: this.form.remarks || undefined
      }
    };

    this.api.initiateOnlineTransaction(request).subscribe({
      next: (otp) => {
        this.otpData.set(otp);
        this.step.set('otp');
        this.notify.info('OTP Sent', `OTP sent to ${otp.maskedEmail}`);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to initiate transaction');
        this.submitting.set(false);
      }
    });
  }

  verifyOtp(): void {
    const otp = this.otpData();
    if (!otp || !this.otpCode) {
      this.notify.warning('Validation', 'Please enter the OTP code');
      return;
    }
    this.submitting.set(true);
    this.api.verifyOnlineTransaction({
      otpReferenceId: otp.otpReferenceId,
      otpCode: this.otpCode
    }).subscribe({
      next: (result) => {
        this.transactionResult.set(result);
        this.step.set('result');
        this.transactions.update(list => [result, ...list]);
        this.notify.success('Success', 'Transaction completed successfully');
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'OTP verification failed');
        this.submitting.set(false);
      }
    });
  }

  cancelOtp(): void {
    this.step.set('form');
    this.otpData.set(null);
    this.otpCode = '';
  }

  newTransaction(): void {
    this.resetForm();
    this.otpData.set(null);
    this.otpCode = '';
    this.transactionResult.set(null);
    this.step.set('form');
  }

  viewDetail(tx: AccountTransactionResponse): void {
    this.selectedTransaction.set(tx);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedTransaction.set(null);
  }

  onTableAction(event: { type: string; row: any }): void {
    if (event.type === 'view') {
      this.viewDetail(event.row);
    }
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'SUCCESS': 'badge-success', 'FAILED': 'badge-danger',
      'PENDING': 'badge-warning', 'CANCELLED': 'badge-neutral',
      'REVERSED': 'badge-info'
    };
    return map[status] || 'badge-neutral';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      'DEPOSIT': 'type-deposit', 'WITHDRAW': 'type-withdraw',
      'TRANSFER': 'type-transfer'
    };
    return map[type] || '';
  }
}
