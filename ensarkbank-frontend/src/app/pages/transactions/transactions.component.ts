import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AccountResponse, AccountTransactionRequest, AccountTransactionResponse,
  OtpInitiateResponse, JournalEntry, BeneficiaryResponse
} from '../../core/models';
import { TransactionType, TransactionChannel, TransactionStatus, Role } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent, LoadingComponent, ConfirmDialogComponent
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  step = signal<'form' | 'otp' | 'result'>('form');
  showFormModal = signal(false);
  transactions = signal<AccountTransactionResponse[]>([]);
  journalHistory = signal<JournalEntry[]>([]);
  accounts = signal<AccountResponse[]>([]);
  isCustomerView = signal(false);
  loading = signal(true);
  submitting = signal(false);
  selectedTransaction = signal<AccountTransactionResponse | null>(null);
  showDetailModal = signal(false);

  showReverseConfirm = signal(false);
  reversingTransaction = signal<JournalEntry | null>(null);
  reversing = signal(false);

  otpData = signal<OtpInitiateResponse | null>(null);
  otpCode = '';
  transactionResult = signal<AccountTransactionResponse | null>(null);
  beneficiaries = signal<BeneficiaryResponse[]>([]);
  receiverMode = signal<'account' | 'beneficiary'>('account');
  receiverAccountFound = signal<boolean | null>(null);
  receiverAccountLookupLoading = signal(false);
  receiverAccountAutoFilled = signal(false);

  accountSearchQuery = signal('');
  searchLoading = signal(false);
  searchMode = signal<'journal' | 'account'>('journal');
  accountTransactions = signal<AccountTransactionResponse[]>([]);

  form = {
    senderAccountNumber: '',
    receiverAccountNumber: '',
    receiverName: '',
    bankName: '',
    routingNumber: '',
    amount: 0,
    remarks: ''
  };

  selectedBeneficiaryId: number | null = null;

  showExportModal = signal(false);
  exportForm = {
    accountNumber: '',
    branchId: 0,
    dateFrom: '',
    dateTo: '',
    format: 'PDF' as 'PDF' | 'EXCEL' | 'CSV'
  };
  exporting = signal(false);

  filterType = signal('');
  filterStatus = signal('');
  filterDateFrom = signal('');
  filterDateTo = signal('');

  accountColumns = signal<TableColumn[]>([
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'senderAccountNumber', label: 'Sender', sortable: true },
    { key: 'receiverAccountNumber', label: 'Receiver', sortable: true },
    { key: 'response.amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'response.transactionType', label: 'Type', sortable: true },
    { key: 'response.channel', label: 'Channel', sortable: true },
    { key: 'response.status', label: 'Status', type: 'status', sortable: true },
    { key: 'direction', label: 'Direction', sortable: true },
  ]);

  journalColumns = signal<TableColumn[]>([
    { key: 'date', label: 'Date', type: 'date', sortable: true },
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'particulars', label: 'Particulars', sortable: true },
    { key: 'accountNumber', label: 'Account', sortable: true },
    { key: 'entryType', label: 'Entry', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
  ]);

  transactionTypes = Object.values(TransactionType);
  transactionChannels = Object.values(TransactionChannel);

  canSearchByAccount = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.CUSTOMER_SERVICE])
  );

  canExportStaff = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE, Role.AUDITOR])
  );

  canReverse = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CUSTOMER_SERVICE])
  );

  filteredTransactions = computed(() => {
    const query = this.accountSearchQuery().toLowerCase().trim();
    if (!query) return this.journalHistory();
    return this.journalHistory().filter(t =>
      t.accountNumber?.toLowerCase().includes(query) ||
      t.counterpartyAccountNumber?.toLowerCase().includes(query) ||
      t.transactionId?.toLowerCase().includes(query) ||
      t.particulars?.toLowerCase().includes(query)
    );
  });

  totalTransactions = computed(() => this.journalHistory().length);
  successCount = computed(() =>
    this.journalHistory().filter(j => j.status === 'SUCCESS').length);
  debitTotal = computed(() =>
    this.journalHistory().filter(j => j.entryType === 'DEBIT').reduce((s, j) => s + (j.amount || 0), 0));
  creditTotal = computed(() =>
    this.journalHistory().filter(j => j.entryType === 'CREDIT').reduce((s, j) => s + (j.amount || 0), 0));
  pendingCount = computed(() =>
    this.journalHistory().filter(j => j.status === 'PENDING').length);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notify: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const isCustomer = this.auth.isCustomer();
    this.isCustomerView.set(isCustomer);

    if (this.canReverse() && !isCustomer) {
      this.journalColumns.update(cols => {
        if (!cols.some(c => c.key === 'actions')) {
          return [...cols, { key: 'actions', label: 'Actions', type: 'actions' as const }];
        }
        return cols;
      });
      this.accountColumns.update(cols => {
        if (!cols.some(c => c.key === 'actions')) {
          return [...cols, { key: 'actions', label: 'Actions', type: 'actions' as const }];
        }
        return cols;
      });
    }

    if (isCustomer) {
      const customerId = this.auth.currentUser()?.id ?? 0;
      this.api.getAccountsByCustomerId(customerId).subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);
          this.cdr.markForCheck();
        },
        error: () => { this.notify.error('Error', 'Failed to load accounts'); }
      });
      this.api.getBeneficiaries(customerId).subscribe({
        next: (data) => this.beneficiaries.set(data),
        error: () => { }
      });
      this.api.getTransactionHistory(customerId).subscribe({
        next: (history) => {
          this.journalHistory.set(history);
          this.cdr.markForCheck();
          this.loading.set(false);
        },
        error: () => { this.notify.error('Error', 'Failed to load transaction history'); this.loading.set(false); }
      });
    } else {
      this.api.getAllJournals().subscribe({
        next: (data) => {
          this.journalHistory.set(data);
          this.cdr.markForCheck();
          this.loading.set(false);
        },
        error: () => { this.notify.error('Error', 'Failed to load transactions'); this.loading.set(false); }
      });
      this.api.getAccounts().subscribe({
        next: data => this.accounts.set(data),
        error: () => { }
      });
    }
  }

  searchByAccount(): void {
    const query = this.accountSearchQuery().trim();
    if (!query) {
      this.loadData();
      return;
    }
    this.searchLoading.set(true);
    this.searchMode.set('account');
    this.api.getTransactionsByAccount(query).subscribe({
      next: (data) => {
        this.accountTransactions.set(data);
        this.searchLoading.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Error', 'Failed to search transactions');
        this.searchLoading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.accountSearchQuery.set('');
    this.searchMode.set('journal');
    this.accountTransactions.set([]);
    this.loadData();
  }

  resetForm(): void {
    this.form = {
      senderAccountNumber: '', receiverAccountNumber: '',
      receiverName: '', bankName: '', routingNumber: '',
      amount: 0, remarks: ''
    };
    this.selectedBeneficiaryId = null;
    this.receiverMode.set('account');
    this.receiverAccountFound.set(null);
    this.receiverAccountLookupLoading.set(false);
    this.receiverAccountAutoFilled.set(false);
  }

  onBeneficiarySelect(beneficiaryId: number): void {
    const b = this.beneficiaries().find(x => x.id === beneficiaryId);
    if (b) {
      this.form.receiverAccountNumber = b.accNumber;
      this.form.receiverName = b.name;
      this.form.bankName = b.provider || '';
    }
  }

  normalizeAccountNumber(input: string): string {
    let cleaned = input.trim().toLowerCase();
    if (cleaned.startsWith('acc-')) {
      cleaned = cleaned.substring(4);
    }
    return cleaned;
  }

  onReceiverAccountInput(): void {
    const raw = this.form.receiverAccountNumber;
    const normalized = this.normalizeAccountNumber(raw);

    if (normalized.length < 12) {
      this.receiverAccountFound.set(null);
      this.receiverAccountAutoFilled.set(false);
      return;
    }

    if (normalized.length === 12) {
      this.lookupReceiverAccount(normalized);
    }
  }

  lookupReceiverAccount(accountNumber: string): void {
    this.receiverAccountLookupLoading.set(true);
    this.receiverAccountFound.set(null);
    this.receiverAccountAutoFilled.set(false);

    this.api.getAccountByNumber(accountNumber).subscribe({
      next: (account) => {
        this.receiverAccountFound.set(true);
        this.form.receiverName = account.holderResponses?.[0]?.accountHolderName || '';
        this.form.bankName = account.branchName || '';
        this.form.routingNumber = account.branchRoutingNumber || '';
        this.receiverAccountAutoFilled.set(true);
        this.receiverAccountLookupLoading.set(false);
      },
      error: () => {
        this.receiverAccountFound.set(false);
        this.receiverAccountAutoFilled.set(false);
        this.receiverAccountLookupLoading.set(false);
        this.form.receiverName = '';
        this.form.bankName = '';
        this.form.routingNumber = '';
      }
    });
  }

  initiateTransaction(): void {
    if (!this.form.senderAccountNumber || this.form.amount <= 0) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    // if (this.receiverMode() === 'account' && !this.form.receiverAccountNumber) {
    //   this.notify.warning('Validation', 'Receiver account number is required');
    //   return;
    // }
    if (this.receiverMode() === 'beneficiary' && this.selectedBeneficiaryId === null) {
      this.notify.warning('Validation', 'Please select a beneficiary');
      return;
    }

    this.submitting.set(true);
    const senderAccount = this.accounts().find(a => a.accountNumber === this.form.senderAccountNumber);
    const normalizedReceiver = this.normalizeAccountNumber(this.form.receiverAccountNumber);
    const request: AccountTransactionRequest = {
      senderAccountId: senderAccount?.id,
      receiverAccountNumber: normalizedReceiver || undefined,
      receiverName: this.form.receiverName || undefined,
      bankName: this.form.bankName || undefined,
      routingNumber: this.form.routingNumber || undefined,
      beneficiaryId: this.selectedBeneficiaryId ?? undefined,
      request: {
        amount: this.form.amount,
        remarks: this.form.remarks || undefined
      }
    };

    this.api.initiateOnlineTransaction(request).subscribe({
      next: (otp) => {
        this.otpData.set(otp);
        this.step.set('otp');
        this.showFormModal.set(false);
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
        if (this.isCustomerView()) {
          const customerId = this.auth.currentUser()?.id ?? 0;
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const startDate = thirtyDaysAgo.toISOString();
          const endDate = new Date().toISOString();
          this.api.getTransactionHistory(customerId, startDate, endDate).subscribe({
            next: (history) => this.journalHistory.set(history),
            error: () => { }
          });
        }
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
    this.showFormModal.set(false);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  newTransaction(): void {
    this.resetForm();
    this.otpData.set(null);
    this.otpCode = '';
    this.transactionResult.set(null);
    this.step.set('form');
    this.showFormModal.set(true);
  }

  viewDetail(tx: AccountTransactionResponse): void {
    this.selectedTransaction.set(tx);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedTransaction.set(null);
  }

  openExportModal(): void {
    const firstAccount = this.accounts()[0]?.accountNumber || '';
    this.exportForm = { accountNumber: firstAccount, branchId: 0, dateFrom: '', dateTo: '', format: 'PDF' };
    this.showExportModal.set(true);
  }

  closeExportModal(): void {
    this.showExportModal.set(false);
  }

  exportTransactions(): void {
    this.exporting.set(true);
    const { accountNumber, branchId, dateFrom, dateTo, format } = this.exportForm;

    let startDate: string | undefined;
    let endDate: string | undefined;
    if (dateFrom) startDate = new Date(dateFrom).toISOString();
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      endDate = d.toISOString();
    }

    if (this.isCustomerView()) {
      const customerId = this.auth.currentUser()?.id ?? 0;
      if (!customerId) {
        this.notify.warning('Validation', 'User not authenticated');
        this.exporting.set(false);
        return;
      }
      this.api.exportTransactionHistory(customerId, format, accountNumber || undefined, startDate, endDate).subscribe({
        next: (blob) => this.handleDownload(blob, accountNumber || 'all_accounts', format),
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to export transaction history');
          this.exporting.set(false);
        }
      });
    } else {
      this.api.exportStaffTransactionHistory(
        format,
        accountNumber || undefined,
        branchId || undefined,
        startDate,
        endDate
      ).subscribe({
        next: (blob) => this.handleDownload(blob, accountNumber || (branchId ? `branch_${branchId}` : 'all'), format),
        error: (err) => {
          this.notify.error('Error', err.error?.message || 'Failed to export transaction history');
          this.exporting.set(false);
        }
      });
    }
  }

  private handleDownload(blob: Blob, label: string, format: string): void {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const ext = format === 'PDF' ? 'pdf' : format === 'EXCEL' ? 'xlsx' : 'csv';
    const safeLabel = label.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `TransactionHistory_${safeLabel}_${timestamp}.${ext}`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    this.notify.success('Downloaded', `${filename} downloaded successfully`);
    this.exporting.set(false);
    this.closeExportModal();
  }

  onTableAction(event: { type: string; row: any }): void {
    if (event.type === 'view') {
      this.viewDetail(event.row);
    } else if (event.type === 'edit') {
      if (this.searchMode() === 'account') {
        this.requestReverseAccountTransaction(event.row);
      } else {
        this.requestReverse(event.row);
      }
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

  requestReverse(entry: JournalEntry): void {
    if (entry.status === 'REVERSED') {
      this.notify.warning('Warning', 'This transaction is already reversed');
      return;
    }
    this.reversingTransaction.set(entry);
    this.showReverseConfirm.set(true);
  }

  confirmReverse(): void {
    const entry = this.reversingTransaction();
    if (!entry) return;

    this.reversing.set(true);
    this.api.reverseAccountTransaction(entry.transactionEntityId).subscribe({
      next: () => {
        this.notify.success('Success', 'Transaction reversed successfully');
        this.showReverseConfirm.set(false);
        this.reversingTransaction.set(null);
        this.reversing.set(false);
        this.loadData();
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to reverse transaction');
        this.reversing.set(false);
      }
    });
  }

  cancelReverse(): void {
    this.showReverseConfirm.set(false);
    this.reversingTransaction.set(null);
  }

  requestReverseAccountTransaction(tx: AccountTransactionResponse): void {
    if (tx.response?.status === 'REVERSED') {
      this.notify.warning('Warning', 'This transaction is already reversed');
      return;
    }
    const entityTxId = tx.response?.journals?.[0]?.transactionEntityId;
    if (!entityTxId) {
      this.notify.error('Error', 'Cannot determine transaction ID for reversal');
      return;
    }
    this.reversing.set(true);
    this.api.reverseAccountTransaction(entityTxId).subscribe({
      next: () => {
        this.notify.success('Success', 'Transaction reversed successfully');
        this.reversing.set(false);
        this.searchByAccount();
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to reverse transaction');
        this.reversing.set(false);
      }
    });
  }
}
