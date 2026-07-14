import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CustomerResponse, KycResponse } from '../../core/models';
import { KYCStatus, KYCStatusLabels, DocumentType } from '../../core/enums/role.enum';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-customer-kyc',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, LoadingComponent],
  templateUrl: './customer-kyc.component.html',
  styleUrls: ['./customer-kyc.component.scss']
})
export class CustomerKycComponent implements OnInit {
  KYCStatusLabels = KYCStatusLabels;

  customer = signal<CustomerResponse | null>(null);
  loading = signal(true);
  uploading = signal(false);

  showUploadModal = signal(false);
  showPreviewModal = signal(false);
  previewDocument = signal<KycResponse | null>(null);
  selectedFiles = signal<{ [key: string]: File | null }>({
    NID: null,
    PASSPORT: null,
    DRIVING_LICENSE: null,
    BIRTH_CERTIFICATE: null
  });

  documentTypes = [
    { key: 'NID', label: 'National ID (NID)' },
    { key: 'PASSPORT', label: 'Passport' },
    { key: 'DRIVING_LICENSE', label: 'Driving License' },
    { key: 'BIRTH_CERTIFICATE', label: 'Birth Certificate' }
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomerData();
  }

  loadCustomerData(): void {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.api.getCustomerById(userId).subscribe({
      next: (data: CustomerResponse) => {
        this.customer.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Error', 'Failed to load KYC data');
        this.loading.set(false);
      }
    });
  }

  getDocCount(): number {
    return this.customer()?.documents?.length || 0;
  }

  getDocsByType(type: string): KycResponse | undefined {
    return this.customer()?.documents?.find(d => d.doc_type === type);
  }

  openUploadModal(): void {
    this.selectedFiles.set({ NID: null, PASSPORT: null, DRIVING_LICENSE: null, BIRTH_CERTIFICATE: null });
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.selectedFiles.set({ NID: null, PASSPORT: null, DRIVING_LICENSE: null, BIRTH_CERTIFICATE: null });
  }

  onFileSelected(event: Event, docType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFiles.update(files => ({ ...files, [docType]: input.files![0] }));
    }
  }

  removeFile(docType: string): void {
    this.selectedFiles.update(files => ({ ...files, [docType]: null }));
  }

  hasSelectedFiles(): boolean {
    const files = this.selectedFiles();
    return Object.values(files).some(f => f !== null);
  }

  uploadDocuments(): void {
    if (!this.hasSelectedFiles() || !this.customer()) return;
    this.uploading.set(true);

    const formData = new FormData();
    const files = this.selectedFiles();
    for (const [key, file] of Object.entries(files)) {
      if (file) {
        formData.append(key, file);
      }
    }

    this.api.uploadKycDocuments(this.customer()!.id, formData).subscribe({
      next: (res: CustomerResponse) => {
        this.notify.success('Success', 'KYC documents uploaded successfully. Status reset to PENDING.');
        this.customer.set(res);
        this.closeUploadModal();
        this.uploading.set(false);
      },
      error: (err: any) => {
        this.notify.error('Error', err.error?.message || 'Failed to upload documents');
        this.uploading.set(false);
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

  getDocStatusLabel(type: string): string {
    const map: Record<string, string> = {
      'NID': 'National ID',
      'PASSPORT': 'Passport',
      'DRIVING_LICENSE': 'Driving License',
      'BIRTH_CERTIFICATE': 'Birth Certificate'
    };
    return map[type] || type;
  }

  openPreview(doc: KycResponse): void {
    this.previewDocument.set(doc);
    this.showPreviewModal.set(true);
  }

  closePreview(): void {
    this.showPreviewModal.set(false);
    this.previewDocument.set(null);
  }

  isImageFile(path: string): boolean {
    if (!path) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path);
  }

  getDocumentUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = 'http://localhost:8085';
    return path.startsWith('/') ? base + path : base + '/' + path;
  }

  onPreviewError(): void {
    this.notify.warning('Preview', 'Unable to load document preview');
    this.closePreview();
  }
}
