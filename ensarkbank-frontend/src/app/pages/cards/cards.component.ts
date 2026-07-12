import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { CardResponse, CardRequest, AccountResponse } from '../../core/models';
import { CardType, CardNetwork, CardStatus } from '../../core/enums/role.enum';
import { TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    StatsCardComponent,
    LoadingComponent, ConfirmDialogComponent
  ],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
  cards = signal<CardResponse[]>([]);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);

  showModal = signal(false);
  showDetailModal = signal(false);
  showPinModal = signal(false);
  showStatusDialog = signal(false);
  selectedCard = signal<CardResponse | null>(null);
  newStatusAction = signal<'BLOCK' | 'UNBLOCK'>('BLOCK');

  pinForm = { oldPin: '', newPin: '', confirmPin: '' };

  form = {
    accountId: 0,
    cardType: '',
    network: '',
    pin: '',
    confirmPin: '',
    dailyLimit: 5000,
    monthlyLimit: 50000
  };

  columns: TableColumn[] = [
    { key: 'cardNumber', label: 'Card Number', sortable: true },
    { key: 'cardType', label: 'Type', sortable: true },
    { key: 'cardNetwork', label: 'Network', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'cardHolderName', label: 'Holder', sortable: true },
    { key: 'expiryDate', label: 'Expiry', sortable: true },
  ];

  cardTypes = Object.values(CardType);
  cardNetworks = Object.values(CardNetwork);

  totalCards = computed(() => this.cards().length);
  activeCards = computed(() => this.cards().filter(c => c.status === 'ACTIVE').length);
  blockedCards = computed(() => this.cards().filter(c => c.status === 'BLOCKED').length);
  debitCards = computed(() => this.cards().filter(c => c.cardType === 'DEBIT').length);

  constructor(
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getCards().subscribe({
      next: data => { this.cards.set(data); this.loading.set(false); },
      error: () => { this.notify.error('Error', 'Failed to load cards'); this.loading.set(false); }
    });
    this.api.getAccounts().subscribe({
      next: data => this.accounts.set(data),
      error: () => {}
    });
  }

  openIssue(): void {
    this.form = {
      accountId: 0, cardType: '', network: '', pin: '',
      confirmPin: '', dailyLimit: 5000, monthlyLimit: 50000
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitCard(): void {
    if (!this.form.accountId || !this.form.cardType || !this.form.network || !this.form.pin) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    if (this.form.pin !== this.form.confirmPin) {
      this.notify.warning('Validation', 'PINs do not match');
      return;
    }
    if (this.form.pin.length < 4) {
      this.notify.warning('Validation', 'PIN must be at least 4 digits');
      return;
    }
    this.submitting.set(true);
    const request: CardRequest = {
      accountId: this.form.accountId,
      cardType: this.form.cardType as CardType,
      cardNetwork: this.form.network as CardNetwork,
      pin: this.form.pin,
      dailyLimit: this.form.dailyLimit,
      monthlyLimit: this.form.monthlyLimit
    };
    this.api.createCard(request).subscribe({
      next: (res) => {
        this.notify.success('Success', `Card ${res.cardNumber} issued`);
        this.cards.update(list => [res, ...list]);
        this.closeModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to issue card');
        this.submitting.set(false);
      }
    });
  }

  viewDetail(card: CardResponse): void {
    this.selectedCard.set(card);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedCard.set(null);
  }

  openPinChange(card: CardResponse): void {
    this.selectedCard.set(card);
    this.pinForm = { oldPin: '', newPin: '', confirmPin: '' };
    this.showPinModal.set(true);
  }

  closePinModal(): void {
    this.showPinModal.set(false);
    this.selectedCard.set(null);
    this.pinForm = { oldPin: '', newPin: '', confirmPin: '' };
  }

  changePin(): void {
    const card = this.selectedCard();
    if (!card) return;
    if (!this.pinForm.newPin) {
      this.notify.warning('Validation', 'Please enter a new PIN');
      return;
    }
    if (this.pinForm.newPin !== this.pinForm.confirmPin) {
      this.notify.warning('Validation', 'New PINs do not match');
      return;
    }
    if (this.pinForm.newPin.length < 4) {
      this.notify.warning('Validation', 'PIN must be at least 4 digits');
      return;
    }
    this.submitting.set(true);
    this.api.changeCardPin(card.cardId, this.pinForm.oldPin, this.pinForm.newPin).subscribe({
      next: () => {
        this.notify.success('Success', 'PIN changed successfully');
        this.closePinModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to change PIN');
        this.submitting.set(false);
      }
    });
  }

  confirmStatusChange(card: CardResponse, action: 'BLOCK' | 'UNBLOCK'): void {
    this.selectedCard.set(card);
    this.newStatusAction.set(action);
    this.showStatusDialog.set(true);
  }

  executeStatusChange(): void {
    const card = this.selectedCard();
    if (!card) return;
    const status = this.newStatusAction() === 'BLOCK' ? 'BLOCKED' : 'ACTIVE';
    this.submitting.set(true);
    this.api.updateCardStatus(card.cardId, status).subscribe({
      next: (res) => {
        this.notify.success('Success', `Card ${status.toLowerCase()}ed`);
        this.cards.update(list => list.map(c => c.cardId === res.cardId ? res : c));
        this.showStatusDialog.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to update status');
        this.showStatusDialog.set(false);
        this.submitting.set(false);
      }
    });
  }

  maskCardNumber(num: string): string {
    if (!num || num.length < 8) return num;
    return '****-****-****-' + num.slice(-4);
  }

  getCardNetworkClass(network: string): string {
    const map: Record<string, string> = {
      'VISA': 'network-visa', 'MASTERCARD': 'network-mastercard'
    };
    return map[network] || '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'badge-success', 'BLOCKED': 'badge-danger',
      'EXPIRED': 'badge-neutral', 'DISABLED': 'badge-warning',
      'PENDING': 'badge-warning'
    };
    return map[status] || 'badge-neutral';
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
}
