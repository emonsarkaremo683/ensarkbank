import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { CardResponse, CardRequest, AccountResponse, CardSettingsRequest } from '../../core/models';
import { CardType, CardNetwork, CardStatus, CardSettingsRequestType, RequestStatus } from '../../core/enums/role.enum';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    LoadingComponent, ConfirmDialogComponent
  ],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit, OnDestroy {
  cards = signal<CardResponse[]>([]);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);

  showModal = signal(false);
  showDetailModal = signal(false);
  showPinModal = signal(false);
  showStatusDialog = signal(false);
  showLimitDialog = signal(false);
  showRequestModal = signal(false);
  showRejectModal = signal(false);
  selectedCard = signal<CardResponse | null>(null);
  newStatusAction = signal<'BLOCK' | 'UNBLOCK'>('BLOCK');
  limitForm = { dailyLimit: 0, monthlyLimit: 0 };

  pendingRequests = signal<CardSettingsRequest[]>([]);
  selectedRequest = signal<CardSettingsRequest | null>(null);
  rejectReason = signal('');

  flippedCards = new Set<number>();
  revealedNumbers = new Set<number>();
  revealedCvvs = new Set<number>();
  private numberTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private cvvTimers = new Map<number, ReturnType<typeof setTimeout>>();

  pinForm = { oldPin: '', newPin: '', confirmPin: '' };

  requestForm = {
    requestType: '' as CardSettingsRequestType | '',
    requestedValue: true
  };

  requestTypes = Object.values(CardSettingsRequestType);

  form = {
    accountId: 0,
    cardType: '',
    network: '',
    pin: '',
    confirmPin: '',
    internationalEnabled: false,
    onlineTransactionEnabled: false
  };

  cardTypes = Object.values(CardType);
  cardNetworks = Object.values(CardNetwork);

  totalCards = computed(() => this.cards().length);
  activeCards = computed(() => this.cards().filter(c => c.status === 'ACTIVE').length);
  blockedCards = computed(() => this.cards().filter(c => c.status === 'BLOCKED').length);
  pendingCards = computed(() => this.cards().filter(c => c.status === 'PENDING').length);
  debitCards = computed(() => this.cards().filter(c => c.cardType === 'DEBIT').length);

  constructor(
    private api: ApiService,
    private notify: NotificationService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.numberTimers.forEach(t => clearTimeout(t));
    this.cvvTimers.forEach(t => clearTimeout(t));
    this.numberTimers.clear();
    this.cvvTimers.clear();
  }

  loadData(): void {
    this.loading.set(true);
    if (this.auth.isCustomer()) {
      const userId = this.auth.currentUser()!.id;
      this.api.getAccountsByCustomerId(userId).subscribe({
        next: accounts => {
          this.accounts.set(accounts);
          if (accounts.length === 0) {
            this.cards.set([]);
            this.loading.set(false);
            return;
          }
          forkJoin(
            accounts.map(acc =>
              this.api.getCardsByAccount(acc.id).pipe(
                map(result => Array.isArray(result) ? result : result ? [result] : []),
                catchError(() => of([]))
              )
            )
          ).subscribe({
            next: results => {
              this.cards.set(results.flat());
              this.loading.set(false);
            },
            error: () => {
              this.notify.error('Error', 'Failed to load cards');
              this.loading.set(false);
            }
          });
        },
        error: () => {
          this.notify.error('Error', 'Failed to load accounts');
          this.loading.set(false);
        }
      });
    } else {
      this.api.getCards().subscribe({
        next: data => { this.cards.set(data); this.loading.set(false); },
        error: () => { this.notify.error('Error', 'Failed to load cards'); this.loading.set(false); }
      });
      this.api.getAccounts().subscribe({
        next: data => this.accounts.set(data),
        error: () => {}
      });
    }

    if (!this.auth.isCustomer()) {
      this.loadPendingRequests();
    }
  }

  loadPendingRequests(): void {
    this.api.getPendingCardSettingsRequests().subscribe({
      next: requests => this.pendingRequests.set(requests),
      error: () => {}
    });
  }

  openRequestModal(card: CardResponse): void {
    this.selectedCard.set(card);
    this.requestForm = { requestType: '', requestedValue: true };
    this.showRequestModal.set(true);
  }

  closeRequestModal(): void {
    this.showRequestModal.set(false);
    this.selectedCard.set(null);
  }

  submitRequest(): void {
    const card = this.selectedCard();
    if (!card || !this.requestForm.requestType) {
      this.notify.warning('Validation', 'Please select a request type');
      return;
    }
    this.submitting.set(true);
    this.api.createCardSettingsRequest(card.cardId, this.requestForm.requestType, this.requestForm.requestedValue).subscribe({
      next: () => {
        this.notify.success('Success', 'Request submitted successfully');
        this.closeRequestModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to submit request');
        this.submitting.set(false);
      }
    });
  }

  approveRequest(request: CardSettingsRequest): void {
    this.submitting.set(true);
    this.api.approveCardSettingsRequest(request.id).subscribe({
      next: () => {
        this.notify.success('Success', 'Request approved');
        this.loadPendingRequests();
        this.loadData();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to approve request');
        this.submitting.set(false);
      }
    });
  }

  openRejectModal(request: CardSettingsRequest): void {
    this.selectedRequest.set(request);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.selectedRequest.set(null);
  }

  confirmReject(): void {
    const request = this.selectedRequest();
    if (!request) return;
    this.submitting.set(true);
    this.api.rejectCardSettingsRequest(request.id, this.rejectReason()).subscribe({
      next: () => {
        this.notify.success('Success', 'Request rejected');
        this.closeRejectModal();
        this.loadPendingRequests();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to reject request');
        this.submitting.set(false);
      }
    });
  }

  openIssue(): void {
    this.form = {
      accountId: 0, cardType: '', network: '', pin: '',
      confirmPin: '', internationalEnabled: false, onlineTransactionEnabled: false
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
      internationalEnabled: this.form.internationalEnabled,
      onlineTransactionEnabled: this.form.onlineTransactionEnabled
    };
    this.api.createCard(request).subscribe({
      next: (res) => {
        const msg = this.auth.isCustomer()
          ? `Card application submitted. Card ending in ${res.cardNumber.slice(-4)} is pending approval.`
          : `Card ${res.cardNumber} issued`;
        this.notify.success('Success', msg);
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

  toggleFlip(cardId: number, event: Event): void {
    event.stopPropagation();
    if (this.flippedCards.has(cardId)) {
      this.flippedCards.delete(cardId);
      this.revealedCvvs.delete(cardId);
      this.clearCvvTimer(cardId);
    } else {
      this.flippedCards.add(cardId);
    }
  }

  isFlipped(cardId: number): boolean {
    return this.flippedCards.has(cardId);
  }

  toggleRevealNumber(cardId: number, event: Event): void {
    event.stopPropagation();
    if (this.revealedNumbers.has(cardId)) {
      this.revealedNumbers.delete(cardId);
      this.clearNumberTimer(cardId);
    } else {
      this.revealedNumbers.add(cardId);
      this.autoRemaskNumber(cardId);
    }
  }

  isNumberRevealed(cardId: number): boolean {
    return this.revealedNumbers.has(cardId);
  }

  toggleRevealCvv(cardId: number, event: Event): void {
    event.stopPropagation();
    if (this.revealedCvvs.has(cardId)) {
      this.revealedCvvs.delete(cardId);
      this.clearCvvTimer(cardId);
    } else {
      this.revealedCvvs.add(cardId);
      this.autoRemaskCvv(cardId);
    }
  }

  isCvvRevealed(cardId: number): boolean {
    return this.revealedCvvs.has(cardId);
  }

  private autoRemaskNumber(cardId: number): void {
    this.clearNumberTimer(cardId);
    const timer = setTimeout(() => {
      this.revealedNumbers.delete(cardId);
      this.numberTimers.delete(cardId);
    }, 10000);
    this.numberTimers.set(cardId, timer);
  }

  private autoRemaskCvv(cardId: number): void {
    this.clearCvvTimer(cardId);
    const timer = setTimeout(() => {
      this.revealedCvvs.delete(cardId);
      this.cvvTimers.delete(cardId);
    }, 10000);
    this.cvvTimers.set(cardId, timer);
  }

  private clearNumberTimer(cardId: number): void {
    const t = this.numberTimers.get(cardId);
    if (t) { clearTimeout(t); this.numberTimers.delete(cardId); }
  }

  private clearCvvTimer(cardId: number): void {
    const t = this.cvvTimers.get(cardId);
    if (t) { clearTimeout(t); this.cvvTimers.delete(cardId); }
  }

  getDisplayNumber(card: CardResponse): string {
    const num = card.cardNumber;
    if (!num) return '';
    if (this.revealedNumbers.has(card.cardId)) {
      return num.replace(/(.{4})/g, '$1 ').trim();
    }
    const last4 = num.slice(-4);
    return `\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ${last4}`;
  }

  formatExpiry(date: string | Date): string {
    if (!date) return 'XX/XX';
    const d = new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
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
    if (card.status === 'PENDING' && action === 'UNBLOCK' && card.cardType === 'CREDIT') {
      this.limitForm = {
        dailyLimit: card.dailyLimit || 0,
        monthlyLimit: card.monthlyLimit || 0
      };
      this.showLimitDialog.set(true);
    } else {
      this.showStatusDialog.set(true);
    }
  }

  getStatusDialogTitle(): string {
    const card = this.selectedCard();
    if (card?.status === 'PENDING') {
      return this.newStatusAction() === 'UNBLOCK' ? 'Approve Card' : 'Reject Card';
    }
    return this.newStatusAction() === 'BLOCK' ? 'Block Card' : 'Unblock Card';
  }

  getStatusDialogMessage(): string {
    const card = this.selectedCard();
    if (card?.status === 'PENDING') {
      return this.newStatusAction() === 'UNBLOCK'
        ? 'This card will be activated and ready for use.'
        : 'This card application will be rejected and disabled.';
    }
    return this.newStatusAction() === 'BLOCK'
      ? 'This card will be blocked and cannot be used for transactions.'
      : 'This card will be reactivated and can be used again.';
  }

  getStatusDialogConfirmText(): string {
    const card = this.selectedCard();
    if (card?.status === 'PENDING') {
      return this.newStatusAction() === 'UNBLOCK' ? 'Approve' : 'Reject';
    }
    return this.newStatusAction() === 'BLOCK' ? 'Block' : 'Unblock';
  }

  getStatusDialogType(): 'danger' | 'warning' | 'info' {
    const card = this.selectedCard();
    if (card?.status === 'PENDING' && this.newStatusAction() === 'UNBLOCK') return 'info';
    return this.newStatusAction() === 'BLOCK' ? 'danger' : 'info';
  }

  executeStatusChange(): void {
    const card = this.selectedCard();
    if (!card) return;
    let status: string;
    let dailyLimit = 0;
    let monthlyLimit = 0;
    if (card.status === 'PENDING' && this.newStatusAction() === 'UNBLOCK') {
      status = 'ACTIVE';
      if (card.cardType === 'CREDIT') {
        dailyLimit = this.limitForm.dailyLimit;
        monthlyLimit = this.limitForm.monthlyLimit;
      }
    } else if (card.status === 'PENDING' && this.newStatusAction() === 'BLOCK') {
      status = 'DISABLED';
    } else {
      status = this.newStatusAction() === 'BLOCK' ? 'BLOCKED' : 'ACTIVE';
    }
    this.submitting.set(true);
    this.api.updateCardStatus(card.cardId, status, dailyLimit, monthlyLimit).subscribe({
      next: (res) => {
        this.notify.success('Success', `Card ${status.toLowerCase()}ed`);
        this.cards.update(list => list.map(c => c.cardId === res.cardId ? res : c));
        this.showStatusDialog.set(false);
        this.showLimitDialog.set(false);
        this.selectedCard.set(null);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to update status');
        this.showStatusDialog.set(false);
        this.showLimitDialog.set(false);
        this.submitting.set(false);
      }
    });
  }

  getCardNetworkClass(network: string): string {
    const map: Record<string, string> = {
      'VISA': 'network-visa', 'MASTERCARD': 'network-mastercard'
    };
    return map[network] || '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': 'badge--success', 'BLOCKED': 'badge--danger',
      'EXPIRED': 'badge--muted', 'DISABLED': 'badge--warning',
      'PENDING': 'badge--warning'
    };
    return map[status] || 'badge--muted';
  }

  isCardDisabled(status: string): boolean {
    return ['BLOCKED', 'DISABLED', 'EXPIRED'].includes(status);
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }
}
