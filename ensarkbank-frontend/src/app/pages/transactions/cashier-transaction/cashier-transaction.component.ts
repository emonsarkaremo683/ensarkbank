import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  AccountResponse, CashierTransactionRequest, CashierTransactionResponse
} from '../../../core/models';
import { TransactionType, Role } from '../../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cashier-transaction',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent, LoadingComponent, ConfirmDialogComponent
  ],
  templateUrl: './cashier-transaction.component.html',
  styleUrls: ['./cashier-transaction.component.scss']
})
export class CashierTransactionComponent implements OnInit {
  showFormModal = signal(false);
  transactions = signal<CashierTransactionResponse[]>([]);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);
  selectedTransaction = signal<CashierTransactionResponse | null>(null);
  showDetailModal = signal(false);

  showReverseConfirm = signal(false);
  reversingTransaction = signal<CashierTransactionResponse | null>(null);
  reversing = signal(false);

  senderFilter = signal('');
  receiverFilter = signal('');

  accountSearchTerm = signal('');
  dropdownOpen = signal(false);

  canReverse = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.BRANCH_MANAGER])
  );

  form = {
    accountNumber: '',
    checkNo: '',
    type: '' as TransactionType | '',
    amount: 0,
    remarks: ''
  };

  filteredAccounts = computed(() => {
    const term = this.accountSearchTerm().toLowerCase().trim();
    const all = this.accounts();
    if (!term) return all;
    return all.filter(a =>
      a.accountNumber.toLowerCase().includes(term) ||
      a.branchName.toLowerCase().includes(term) ||
      a.holderResponses?.[0]?.accountHolderName?.toLowerCase().includes(term)
    );
  });

  accountLabel = computed(() => {
    if (this.form.type === TransactionType.DEPOSIT) return 'Receiver Account *';
    if (this.form.type === TransactionType.WITHDRAW) return 'Sender Account *';
    return 'Customer Account *';
  });

  selectedAccountDisplay = computed(() => {
    const acc = this.accounts().find(a => a.accountNumber === this.form.accountNumber);
    if (!acc) return '';
    return `${acc.accountNumber} - ${acc.branchName} (${this.formatCurrency(acc.availableBalance)})`;
  });

  columns = signal<TableColumn[]>([
    { key: 'id', label: 'ID', sortable: true },
    { key: 'checkNo', label: 'Check No', sortable: true },
    { key: 'cashierName', label: 'Cashier', sortable: true },
    { key: 'branchName', label: 'Branch', sortable: true },
    { key: 'transaction.amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'transaction.transactionType', label: 'Type', sortable: true },
    { key: 'transaction.status', label: 'Status', type: 'status', sortable: true },
  ]);

  transactionTypes: TransactionType[] = [TransactionType.DEPOSIT, TransactionType.WITHDRAW];

  filteredTransactions = computed(() => {
    const sender = this.senderFilter().toLowerCase().trim();
    const receiver = this.receiverFilter().toLowerCase().trim();
    let result = this.transactions();

    if (sender) {
      result = result.filter(t => {
        return t.journals?.some(j =>
          j.entryType === 'DEBIT' && j.accountNumber?.toLowerCase().includes(sender)
        );
      });
    }

    if (receiver) {
      result = result.filter(t => {
        return t.journals?.some(j =>
          j.entryType === 'CREDIT' && j.accountNumber?.toLowerCase().includes(receiver)
        );
      });
    }

    return result;
  });

  totalTransactions = computed(() => this.filteredTransactions().length);
  successCount = computed(() => this.filteredTransactions().filter(t => t.transaction?.status === 'SUCCESS').length);
  totalAmount = computed(() => this.filteredTransactions().reduce((s, t) => s + (t.transaction?.amount || 0), 0));
  pendingCount = computed(() => this.filteredTransactions().filter(t => t.transaction?.status === 'PENDING').length);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    if (this.canReverse()) {
      this.columns.update(cols => {
        if (!cols.some(c => c.key === 'actions')) {
          return [...cols, { key: 'actions', label: 'Actions', type: 'actions' as const }];
        }
        return cols;
      });
    }

    this.api.getCashierTransactions().subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Error', 'Failed to load cashier transactions');
        this.loading.set(false);
      }
    });
    this.api.getAccounts().subscribe({
      next: (data) => this.accounts.set(data),
      error: () => {}
    });
  }

  clearFilters(): void {
    this.senderFilter.set('');
    this.receiverFilter.set('');
  }

  resetForm(): void {
    this.form = {
      accountNumber: '',
      checkNo: '',
      type: '',
      amount: 0,
      remarks: ''
    };
    this.accountSearchTerm.set('');
    this.dropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  selectAccount(account: AccountResponse): void {
    this.form.accountNumber = account.accountNumber;
    this.accountSearchTerm.set('');
    this.dropdownOpen.set(false);
  }

  onAccountSearch(term: string): void {
    this.accountSearchTerm.set(term);
    this.dropdownOpen.set(true);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  newTransaction(): void {
    this.resetForm();
    this.showFormModal.set(true);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  submitTransaction(): void {
    if (!this.form.accountNumber || !this.form.type || this.form.amount <= 0) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }

    const user = this.auth.currentUser();
    if (!user) {
      this.notify.error('Error', 'User not authenticated');
      return;
    }

    this.submitting.set(true);

    const selectedAccount = this.accounts().find(a => a.accountNumber === this.form.accountNumber);

    const request: CashierTransactionRequest = {
      checkNo: this.form.checkNo || undefined,
      branchId: user.branchId!,
      accountNumber: this.form.accountNumber,
      accountName: selectedAccount?.holderResponses?.[0]?.accountHolderName || undefined,
      type: this.form.type as TransactionType,
      bankName: selectedAccount?.branchName || undefined,
      employeeId: user.id,
      routingNumber: selectedAccount?.branchRoutingNumber || undefined,
      transactionRequest: {
        amount: this.form.amount,
        remarks: this.form.remarks || undefined
      }
    };

    this.api.processCashierTransaction(request).subscribe({
      next: (response) => {
        this.transactions.update(list => [response, ...list]);
        this.notify.success('Success', 'Transaction processed successfully');
        this.submitting.set(false);
        this.closeFormModal();
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to process transaction');
        this.submitting.set(false);
      }
    });
  }

  viewDetail(tx: CashierTransactionResponse): void {
    this.selectedTransaction.set(tx);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedTransaction.set(null);
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

  onTableAction(event: { type: string; row: any }): void {
    if (event.type === 'edit') {
      this.requestReverse(event.row);
    }
  }

  requestReverse(tx: CashierTransactionResponse): void {
    if (tx.transaction?.status === 'REVERSED') {
      this.notify.warning('Warning', 'This transaction is already reversed');
      return;
    }
    this.reversingTransaction.set(tx);
    this.showReverseConfirm.set(true);
  }

  confirmReverse(): void {
    const tx = this.reversingTransaction();
    if (!tx || !tx.transactionEntityId) return;

    this.reversing.set(true);
    this.api.reverseCashierTransaction(tx.transactionEntityId).subscribe({
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
}
