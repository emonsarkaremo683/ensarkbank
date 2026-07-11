import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AccountResponse, AccountRequest, Branch, CustomerResponse, AccountHolderRequest
} from '../../core/models';
import { AccountType, AccountStatus, HolderType } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent,
    LoadingComponent
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  accounts = signal<AccountResponse[]>([]);
  branches = signal<Branch[]>([]);
  customers = signal<CustomerResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);
  searchQuery = signal('');

  showModal = signal(false);
  showDetailModal = signal(false);
  showStatusModal = signal(false);
  selectedAccount = signal<AccountResponse | null>(null);
  newStatus = signal('');

  form = {
    accountType: '',
    initialBalance: 0,
    branchId: 0,
    nomineeName: '',
    nomineePhone: '',
    nomineeRelation: '',
    holderCustomerId: 0,
    holderType: 'PRIMARY'
  };

  columns: TableColumn[] = [
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'accountType', label: 'Type', sortable: true },
    { key: 'balance', label: 'Balance', type: 'currency', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'branchName', label: 'Branch', sortable: true },
    { key: 'createdAt', label: 'Created At', type: 'date', sortable: true },
  ];

  accountTypes = Object.values(AccountType);
  accountStatuses = Object.values(AccountStatus);

  filteredAccounts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.accounts();
    return this.accounts().filter(a =>
      a.accountNumber.toLowerCase().includes(q) ||
      a.accountType.toLowerCase().includes(q) ||
      a.branchName.toLowerCase().includes(q)
    );
  });

  totalBalance = computed(() => this.accounts().reduce((s, a) => s + a.balance, 0));
  activeCount = computed(() => this.accounts().filter(a => a.status === 'ACTIVE').length);
  blockedCount = computed(() => this.accounts().filter(a => a.status === 'BLOCKED').length);

  constructor(
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getAccounts().subscribe({
      next: data => { this.accounts.set(data); this.loading.set(false); },
      error: () => { this.notify.error('Error', 'Failed to load accounts'); this.loading.set(false); }
    });
    this.api.getBranches().subscribe({
      next: data => this.branches.set(data),
      error: () => {}
    });
    this.api.getCustomers().subscribe({
      next: data => this.customers.set(data),
      error: () => {}
    });
  }

  openCreate(): void {
    this.form = {
      accountType: '', initialBalance: 0, branchId: 0,
      nomineeName: '', nomineePhone: '', nomineeRelation: '',
      holderCustomerId: 0, holderType: 'PRIMARY'
    };
    this.showModal.set(true);
  }

  closeCreate(): void {
    this.showModal.set(false);
  }

  submitAccount(): void {
    if (!this.form.accountType || !this.form.branchId) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    this.submitting.set(true);
    const request: AccountRequest = {
      accountType: this.form.accountType as AccountType,
      initialBalance: this.form.initialBalance,
      branchId: this.form.branchId,
      nomineeName: this.form.nomineeName || undefined,
      nomineePhone: this.form.nomineePhone || undefined,
      nomineeRelation: this.form.nomineeRelation || undefined,
      accountHolders: this.form.holderCustomerId ? [{
        holderType: this.form.holderType as HolderType,
        permissions: ['DEPOSIT', 'WITHDRAW', 'TRANSFER'],
        customerId: this.form.holderCustomerId
      }] : []
    };
    this.api.createAccount(request).subscribe({
      next: (res) => {
        this.notify.success('Success', `Account ${res.accountNumber} created`);
        this.accounts.update(list => [res, ...list]);
        this.closeCreate();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to create account');
        this.submitting.set(false);
      }
    });
  }

  viewDetail(account: AccountResponse): void {
    this.selectedAccount.set(account);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedAccount.set(null);
  }

  openStatusModal(account: AccountResponse): void {
    this.selectedAccount.set(account);
    this.newStatus.set(account.status);
    this.showStatusModal.set(true);
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
    this.selectedAccount.set(null);
  }

  updateStatus(): void {
    const acc = this.selectedAccount();
    if (!acc) return;
    this.submitting.set(true);
    this.api.updateAccountStatus(acc.id, this.newStatus()).subscribe({
      next: (res) => {
        this.notify.success('Status Updated', `Account ${acc.accountNumber} is now ${this.newStatus()}`);
        this.accounts.update(list => list.map(a => a.id === res.id ? res : a));
        this.closeStatusModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to update status');
        this.submitting.set(false);
      }
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'badge-success', 'BLOCKED': 'badge-danger',
      'FREEZE': 'badge-info', 'CLOSED': 'badge-neutral',
      'INACTIVE': 'badge-warning', 'PENDING': 'badge-warning'
    };
    return map[status] || 'badge-neutral';
  }

  onTableAction(event: { type: string; row: any }): void {
    if (event.type === 'view') {
      this.viewDetail(event.row);
    }
  }

  getHolderName(account: AccountResponse): string {
    if (!account.holders || account.holders.length === 0) return '-';
    return account.holders.map(h => h.name).join(', ');
  }
}
