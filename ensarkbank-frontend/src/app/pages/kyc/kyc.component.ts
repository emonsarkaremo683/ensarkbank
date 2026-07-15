import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { CustomerResponse, KycResponse } from '../../core/models';
import { KYCStatus, KYCStatusLabels } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent,
    LoadingComponent
  ],
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss']
})
export class KycComponent implements OnInit {
  KYCStatus = KYCStatus;
  KYCStatusLabels = KYCStatusLabels;

  customers = signal<CustomerResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);
  statusFilter = signal<string>('');

  showModal = signal(false);
  showStatusDialog = signal(false);
  showPreviewModal = signal(false);
  selectedCustomer = signal<CustomerResponse | null>(null);
  previewDocument = signal<KycResponse | null>(null);
  newStatus = signal('');

  columns: TableColumn[] = [
    { key: 'name', label: 'Customer', type: 'text', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'phone', label: 'Phone', type: 'text', sortable: true },
    { key: 'kycStatus', label: 'KYC Status', type: 'status', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
  ];

  kycStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'];

  totalCustomers = computed(() => this.customers().length);
  pendingCount = computed(() => this.customers().filter(c => c.kycStatus === 'PENDING').length);
  verifiedCount = computed(() => this.customers().filter(c => c.kycStatus === 'VERIFIED').length);
  rejectedCount = computed(() => this.customers().filter(c => c.kycStatus === 'REJECTED').length);

  filteredCustomers = computed(() => {
    const filter = this.statusFilter();
    if (!filter) return this.customers();
    return this.customers().filter(c => c.kycStatus === filter);
  });

  constructor(
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.api.getCustomers().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Error', 'Failed to load customers');
      }
    });
  }

  onAction(event: { type: string; row: CustomerResponse }): void {
    if (event.type === 'view' || event.type === 'edit') {
      this.viewCustomer(event.row);
    }
  }

  viewCustomer(customer: CustomerResponse): void {
    this.selectedCustomer.set(customer);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedCustomer.set(null);
  }

  openStatusDialog(customer: CustomerResponse): void {
    this.selectedCustomer.set(customer);
    this.newStatus.set(customer.kycStatus || 'PENDING');
    this.showStatusDialog.set(true);
  }

  closeStatusDialog(): void {
    this.showStatusDialog.set(false);
    this.selectedCustomer.set(null);
  }

  updateKycStatus(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;
    this.submitting.set(true);
    this.api.updateKycStatus(customer.id, this.newStatus()).subscribe({
      next: (res: CustomerResponse) => {
        this.notify.success('KYC Updated', `${customer.name}'s KYC status updated to ${this.newStatus()}`);
        this.customers.update(list => list.map(c => c.id === res.id ? { ...c, kycStatus: this.newStatus() as KYCStatus } : c));
        this.closeStatusDialog();
        this.submitting.set(false);
      },
      error: (err: any) => {
        this.notify.error('Error', err.error?.message || 'Failed to update KYC status');
        this.submitting.set(false);
      }
    });
  }

  getStatusClass(status: string | undefined): string {
    const map: Record<string, string> = {
      'PENDING': 'badge-warning',
      'UNDER_REVIEW': 'badge-info',
      'VERIFIED': 'badge-success',
      'REJECTED': 'badge-danger',
      'EXPIRED': 'badge-neutral'
    };
    return map[status || ''] || 'badge-neutral';
  }

  getDocCount(customer: CustomerResponse): number {
    return customer.documents?.length || 0;
  }

  openPreview(doc: KycResponse): void {
    this.previewDocument.set(doc);
    this.showPreviewModal.set(true);
  }

  closePreview(): void {
    this.showPreviewModal.set(false);
    this.previewDocument.set(null);
  }

  getStatusLabel(status: string | undefined): string {
    return KYCStatusLabels[status as KYCStatus] || status || 'Unknown';
  }

  getDocStatusLabel(type: string): string {
    const map: Record<string, string> = {
      'NID': 'National ID',
      'PASSPORT': 'Passport',
      'DRIVING_LICENSE': 'Driving License',
      'BIRTH_CERTIFICATE': 'Birth Certificate'
    };
    return map[type] || type;
  }

  isImageFile(path: string): boolean {
    if (!path) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path);
  }

  getDocumentUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = 'http://localhost:8085';
    if (path.startsWith('/')) return base + path;
    return base + '/uploads/' + path;
  }

  onPreviewError(): void {
    this.notify.warning('Preview', 'Unable to load document preview');
    this.closePreview();
  }
}
