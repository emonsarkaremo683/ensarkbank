import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { BeneficiaryResponse, BeneficiaryRequest } from '../../core/models';
import { BeneficiaryType, Role } from '../../core/enums/role.enum';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [CommonModule, FormsModule, StatsCardComponent, LoadingComponent, ConfirmDialogComponent],
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);

  beneficiaries = signal<BeneficiaryResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);

  showModal = signal(false);
  showDeleteDialog = signal(false);
  selectedBeneficiary = signal<BeneficiaryResponse | null>(null);

  form = {
    name: '',
    accNumber: '',
    beneficiaryType: '',
    provider: '',
    routingNumber: ''
  };

  beneficiaryTypes = Object.values(BeneficiaryType);

  totalBeneficiaries = computed(() => this.beneficiaries().length);
  bankBeneficiaries = computed(() => this.beneficiaries().filter(b => b.beneficiaryType === 'BANK').length);
  mobileBeneficiaries = computed(() => this.beneficiaries().filter(b => b.beneficiaryType === 'BKASH' || b.beneficiaryType === 'NAGAD').length);

  isCustomer = computed(() => this.auth.currentUser()?.role === Role.CUSTOMER);

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    this.loading.set(true);
    if (this.isCustomer()) {
      const userId = this.auth.currentUser()?.id;
      if (userId) {
        this.api.getBeneficiaries(userId).subscribe({
          next: data => { this.beneficiaries.set(data); this.loading.set(false); },
          error: () => { this.notify.error('Error', 'Failed to load beneficiaries'); this.loading.set(false); }
        });
      } else {
        this.loading.set(false);
      }
    } else {
      this.api.getAllBeneficiaries().subscribe({
        next: (data: BeneficiaryResponse[]) => { this.beneficiaries.set(data); this.loading.set(false); },
        error: () => { this.notify.error('Error', 'Failed to load beneficiaries'); this.loading.set(false); }
      });
    }
  }

  openCreate(): void {
    this.form = { name: '', accNumber: '', beneficiaryType: '', provider: '', routingNumber: '' };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitBeneficiary(): void {
    if (!this.form.name || !this.form.accNumber || !this.form.beneficiaryType) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    this.submitting.set(true);
    const userId = this.auth.currentUser()?.id || 0;
    const request: BeneficiaryRequest = {
      name: this.form.name,
      accNumber: this.form.accNumber,
      beneficiaryType: this.form.beneficiaryType as BeneficiaryType,
      provider: this.form.provider || undefined,
      routingNumber: this.form.routingNumber || undefined,
      customerId: userId
    };
    this.api.createBeneficiary(request).subscribe({
      next: (res) => {
        this.notify.success('Success', `Beneficiary "${res.name}" added`);
        this.beneficiaries.update(list => [res, ...list]);
        this.closeModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to add beneficiary');
        this.submitting.set(false);
      }
    });
  }

  confirmDelete(beneficiary: BeneficiaryResponse): void {
    this.selectedBeneficiary.set(beneficiary);
    this.showDeleteDialog.set(true);
  }

  executeDelete(): void {
    const beneficiary = this.selectedBeneficiary();
    if (!beneficiary) return;
    this.submitting.set(true);
    this.api.deleteBeneficiary(beneficiary.id).subscribe({
      next: () => {
        this.notify.success('Deleted', `Beneficiary "${beneficiary.name}" removed`);
        this.beneficiaries.update(list => list.filter(b => b.id !== beneficiary.id));
        this.showDeleteDialog.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to delete beneficiary');
        this.showDeleteDialog.set(false);
        this.submitting.set(false);
      }
    });
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      'BKASH': 'badge-bkash',
      'NAGAD': 'badge-nagad',
      'BANK': 'badge-bank',
      'CARD': 'badge-card',
      'INTER_BANK': 'badge-interbank'
    };
    return map[type] || 'badge-neutral';
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'BKASH': 'M',
      'NAGAD': 'N',
      'BANK': 'B',
      'CARD': 'C',
      'INTER_BANK': 'IB'
    };
    return map[type] || '?';
  }
}
