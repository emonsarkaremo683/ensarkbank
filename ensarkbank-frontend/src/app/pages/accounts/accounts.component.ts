import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  AccountResponse, Branch, CustomerResponse, AccountHolderRequest
} from '../../core/models';
import { AccountType, AccountStatus, HolderType, NomineeRelation } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

interface HolderEntry {
  customerId: number;
  customerName: string;
  customerEmail: string;
  holderType: HolderType;
  canWithdraw: boolean;
  canDeposit: boolean;
  canApproveTransaction: boolean;
  searching: boolean;
  notFound: boolean;
}

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
  loading = signal(true);
  submitting = signal(false);
  searchQuery = signal('');

  showModal = signal(false);
  showDetailModal = signal(false);
  showStatusModal = signal(false);
  selectedAccount = signal<AccountResponse | null>(null);
  newStatus = signal('');

  currentStep = signal(1);
  readonly totalSteps = 2;

  step1 = {
    accountType: '' as AccountType | '',
    availableBalance: 0,
    branchId: 0
  };

  holders = signal<HolderEntry[]>([]);

  step2 = {
    n_name: '',
    n_email: '',
    n_phone: '',
    relation: '' as NomineeRelation | '',
    photo: null as File | null,
    nidFront: null as File | null,
    nidBack: null as File | null
  };

  columns: TableColumn[] = [
    { key: 'accountNumber', label: 'Account Number', sortable: true },
    { key: 'accountType', label: 'Type', sortable: true },
    { key: 'availableBalance', label: 'Available Balance', type: 'currency', sortable: true },
    { key: 'currentBalance', label: 'Current Balance', type: 'currency', sortable: true },
    { key: 'accountStatus', label: 'Status', type: 'status', sortable: true },
    { key: 'branchName', label: 'Branch', sortable: true },
  ];

  accountTypes = Object.values(AccountType);
  accountStatuses = Object.values(AccountStatus);
  nomineeRelations = Object.values(NomineeRelation);
  holderTypes = [HolderType.PRIMARY, HolderType.SECONDARY, HolderType.OPTIONAL];

  filteredAccounts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.accounts();
    return this.accounts().filter(a =>
      a.accountNumber.toLowerCase().includes(q) ||
      a.accountType.toLowerCase().includes(q) ||
      a.branchName.toLowerCase().includes(q)
    );
  });

  totalBalance = computed(() => this.accounts().reduce((s, a) => s + Number(a.availableBalance || 0), 0));
  activeCount = computed(() => this.accounts().filter(a => a.accountStatus === 'ACTIVE').length);
  blockedCount = computed(() => this.accounts().filter(a => a.accountStatus === 'BLOCKED').length);

  isMultiHolder = computed(() =>
    this.step1.accountType === AccountType.BUSINESS ||
    this.step1.accountType === AccountType.JOINT_ACCOUNT
  );

  currentLoggedInCustomer = computed(() => this.auth.currentUser());

  constructor(
    private api: ApiService,
    private auth: AuthService,
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
  }

  openCreate(): void {
    this.currentStep.set(1);
    this.step1 = { accountType: '', availableBalance: 0, branchId: 0 };
    this.holders.set([]);
    this.step2 = {
      n_name: '', n_email: '', n_phone: '', relation: '',
      photo: null, nidFront: null, nidBack: null
    };
    this.showModal.set(true);
  }

  closeCreate(): void {
    this.showModal.set(false);
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      if (this.currentStep() === 1) {
        if (!this.step1.accountType || !this.step1.branchId) {
          this.notify.warning('Validation', 'Please select account type and branch');
          return;
        }
      }
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onAccountTypeChange(): void {
    const isMulti = this.isMultiHolder();
    if (isMulti) {
      const user = this.currentLoggedInCustomer();
      const primaryHolder = this.createHolderEntry(HolderType.PRIMARY);
      primaryHolder.customerId = user?.id || 0;
      primaryHolder.customerName = user?.name || '';
      primaryHolder.customerEmail = user?.email || '';
      const secondHolder = this.createHolderEntry(HolderType.SECONDARY);
      this.holders.set([primaryHolder, secondHolder]);
    } else {
      this.holders.set([]);
    }
  }

  createHolderEntry(type: HolderType): HolderEntry {
    return {
      customerId: 0,
      customerName: '',
      customerEmail: '',
      holderType: type,
      canWithdraw: true,
      canDeposit: true,
      canApproveTransaction: type === HolderType.PRIMARY,
      searching: false,
      notFound: false
    };
  }

  addHolder(): void {
    this.holders.update(list => [...list, this.createHolderEntry(HolderType.SECONDARY)]);
  }

  removeHolder(index: number): void {
    if (this.holders().length <= 2) return;
    this.holders.update(list => list.filter((_, i) => i !== index));
  }

  searchCustomer(index: number, email: string): void {
    if (!email || email.length < 3) return;
    this.holders.update(list => {
      const updated = [...list];
      updated[index] = { ...updated[index], searching: true, notFound: false };
      return updated;
    });
    this.api.getCustomerByEmail(email).subscribe({
      next: (customer: CustomerResponse) => {
        this.holders.update(list => {
          const updated = [...list];
          updated[index] = {
            ...updated[index],
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            searching: false,
            notFound: false
          };
          return updated;
        });
      },
      error: () => {
        this.holders.update(list => {
          const updated = [...list];
          updated[index] = {
            ...updated[index],
            customerId: 0,
            customerName: '',
            searching: false,
            notFound: true
          };
          return updated;
        });
      }
    });
  }

  updateHolderField(index: number, field: keyof HolderEntry, value: any): void {
    this.holders.update(list => {
      const updated = [...list];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.step2.photo = input.files[0];
  }

  onNidFrontSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.step2.nidFront = input.files[0];
  }

  onNidBackSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.step2.nidBack = input.files[0];
  }

  submitAccount(): void {
    if (!this.step1.accountType || !this.step1.branchId) {
      this.notify.warning('Validation', 'Please fill account info');
      return;
    }
    if (this.isMultiHolder()) {
      const invalid = this.holders().some(h => !h.customerId);
      if (invalid) {
        this.notify.warning('Validation', 'Please search and select all account holders');
        return;
      }
    }
    this.submitting.set(true);

    let accountHolders: AccountHolderRequest[];
    if (this.isMultiHolder()) {
      accountHolders = this.holders().map(h => ({
        holderType: h.holderType,
        canWithdraw: h.canWithdraw,
        canDeposit: h.canDeposit,
        canApproveTransaction: h.canApproveTransaction,
        customerId: h.customerId
      }));
    } else {
      const user = this.currentLoggedInCustomer();
      accountHolders = [{
        holderType: HolderType.PRIMARY,
        canWithdraw: true,
        canDeposit: true,
        canApproveTransaction: true,
        customerId: user?.id || 0
      }];
    }

    const dto = {
      accountType: this.step1.accountType,
      availableBalance: this.step1.availableBalance,
      branchId: this.step1.branchId,
      n_name: this.step2.n_name || undefined,
      n_email: this.step2.n_email || undefined,
      n_phone: this.step2.n_phone || undefined,
      relation: this.step2.relation || undefined,
      accountHolders
    };
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (this.step2.photo) formData.append('photo', this.step2.photo);
    if (this.step2.nidFront) formData.append('nid_front', this.step2.nidFront);
    if (this.step2.nidBack) formData.append('nid_back', this.step2.nidBack);
    this.api.createAccount(formData).subscribe({
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
    this.newStatus.set(account.accountStatus);
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
    if (!account.holderResponses || account.holderResponses.length === 0) return '-';
    return account.holderResponses.map(h => h.accountHolderName).join(', ');
  }
}
