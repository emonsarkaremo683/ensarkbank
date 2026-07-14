import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  ATMResponse, ATMRequest, ATMTransactionResponse, Branch,
  BalanceCheckRequest
} from '../../core/models';
import { ATMStatus, ATMTransactionType } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-atm',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent,
    LoadingComponent
  ],
  templateUrl: './atm.component.html',
  styleUrls: ['./atm.component.scss']
})
export class AtmComponent implements OnInit {
  ATMTransactionType = ATMTransactionType;

  atms = signal<ATMResponse[]>([]);
  branches = signal<Branch[]>([]);
  atmTransactions = signal<ATMTransactionResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);

  showAddModal = signal(false);
  showDetailModal = signal(false);
  showRefillModal = signal(false);
  showBalanceModal = signal(false);
  showStatusDialog = signal(false);
  showTransactionsModal = signal(false);

  selectedAtm = signal<ATMResponse | null>(null);
  newStatus = signal('');

  refillAmount = 0;
  balanceForm: BalanceCheckRequest = { cardNumber: '', pin: '' };
  balanceResult = signal<any>(null);

  form = {
    branchId: 0,
    balance: 0,
    dailyLimit: 20000,
    addressHolding: '',
    addressArea: '',
    addressPostalCode: '',
    status: 'ACTIVE'
  };

  columns: TableColumn[] = [
    { key: 'atmId', label: 'ATM ID', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'availableBalance', label: 'Balance', type: 'currency', sortable: true },
    { key: 'limit', label: 'Daily Limit', type: 'currency', sortable: true },
    { key: 'branchName', label: 'Branch', sortable: true },
  ];

  atmStatuses = ['ACTIVE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

  totalAtms = computed(() => this.atms().length);
  activeAtms = computed(() => this.atms().filter(a => a.status === 'ACTIVE').length);
  offlineAtms = computed(() => this.atms().filter(a => a.status === 'OFFLINE' || a.status === 'OUT_OF_SERVICE').length);
  totalBalance = computed(() => this.atms().reduce((s, a) => s + (a.availableBalance || 0), 0));

  constructor(
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getATMs().subscribe({
      next: data => { this.atms.set(data); this.loading.set(false); },
      error: () => { this.notify.error('Error', 'Failed to load ATMs'); this.loading.set(false); }
    });
    this.api.getBranches().subscribe({
      next: data => this.branches.set(data),
      error: () => {}
    });
  }

  openAdd(): void {
    this.form = {
      branchId: 0, balance: 0, dailyLimit: 20000,
      addressHolding: '', addressArea: '', addressPostalCode: '', status: 'ACTIVE'
    };
    this.showAddModal.set(true);
  }

  closeModal(): void {
    this.showAddModal.set(false);
  }

  submitAtm(): void {
    if (!this.form.branchId || this.form.balance <= 0) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    this.submitting.set(true);
    const address = [this.form.addressHolding, this.form.addressArea, this.form.addressPostalCode].filter(Boolean).join(', ');
    const request: ATMRequest = {
      branchId: this.form.branchId,
      balance: this.form.balance,
      limit: this.form.dailyLimit,
      status: this.form.status as ATMStatus,
      address: address || undefined
    };
    this.api.createATM(request).subscribe({
      next: (res) => {
        this.notify.success('Success', `ATM ${res.atmId} created`);
        this.atms.update(list => [res, ...list]);
        this.closeModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to create ATM');
        this.submitting.set(false);
      }
    });
  }

  viewDetail(atm: ATMResponse): void {
    this.selectedAtm.set(atm);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedAtm.set(null);
  }

  openRefill(atm: ATMResponse): void {
    this.selectedAtm.set(atm);
    this.refillAmount = 0;
    this.showRefillModal.set(true);
  }

  closeRefill(): void {
    this.showRefillModal.set(false);
    this.selectedAtm.set(null);
    this.refillAmount = 0;
  }

  submitRefill(): void {
    const atm = this.selectedAtm();
    if (!atm || this.refillAmount <= 0) return;
    this.submitting.set(true);
    const request: ATMRequest = {
      balance: (atm.availableBalance || 0) + this.refillAmount,
      limit: atm.limit || 0,
      address: atm.address,
      status: atm.status
    };
    this.api.updateATM(atm.atmId, request).subscribe({
      next: () => {
        this.notify.success('Success', `ATM refilled with ${this.formatCurrency(this.refillAmount)}`);
        this.loadData();
        this.closeRefill();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to refill ATM');
        this.submitting.set(false);
      }
    });
  }

  openBalance(): void {
    this.balanceForm = { cardNumber: '', pin: '' };
    this.balanceResult.set(null);
    this.showBalanceModal.set(true);
  }

  closeBalance(): void {
    this.showBalanceModal.set(false);
    this.balanceResult.set(null);
  }

  checkBalance(): void {
    if (!this.balanceForm.cardNumber || !this.balanceForm.pin) {
      this.notify.warning('Validation', 'Please enter card number and PIN');
      return;
    }
    this.submitting.set(true);
    this.api.checkATMBalance(this.balanceForm).subscribe({
      next: (res) => {
        this.balanceResult.set(res);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Balance check failed');
        this.submitting.set(false);
      }
    });
  }

  openStatusModal(atm: ATMResponse): void {
    this.selectedAtm.set(atm);
    this.newStatus.set(atm.status);
    this.showStatusDialog.set(true);
  }

  closeStatusModal(): void {
    this.showStatusDialog.set(false);
  }

  updateStatus(): void {
    const atm = this.selectedAtm();
    if (!atm) return;
    this.submitting.set(true);
    this.api.updateATMStatus(atm.atmId, this.newStatus()).subscribe({
      next: (res) => {
        this.notify.success('Status Updated', `ATM ${atm.atmId} is now ${this.newStatus()}`);
        this.atms.update(list => list.map(a => a.atmId === res.atmId ? res : a));
        this.closeStatusModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to update status');
        this.submitting.set(false);
      }
    });
  }

  viewAtmTransactions(atm: ATMResponse): void {
    this.selectedAtm.set(atm);
    this.api.getATMTransactionsByATM(atm.atmId).subscribe({
      next: (data) => {
        this.atmTransactions.set(data);
        this.showTransactionsModal.set(true);
      },
      error: () => this.notify.error('Error', 'Failed to load ATM transactions')
    });
  }

  closeTransactions(): void {
    this.showTransactionsModal.set(false);
    this.selectedAtm.set(null);
  }

  getAtmTransactions(): ATMTransactionResponse[] {
    return this.atmTransactions();
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'badge-success', 'OFFLINE': 'badge-warning',
      'MAINTENANCE': 'badge-info', 'OUT_OF_SERVICE': 'badge-danger'
    };
    return map[status] || 'badge-neutral';
  }
}
