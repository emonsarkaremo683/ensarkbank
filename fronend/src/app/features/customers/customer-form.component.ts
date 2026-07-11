import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [RouterLink, FormsModule, TitleCasePipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <div class="d-flex align-items-center gap-2">
          <a routerLink="/customers" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </a>
          <div>
            <h1>{{ editMode() ? 'Edit Customer' : 'New Customer' }}</h1>
            <p>{{ editMode() ? 'Update customer information and documents' : 'Register a new customer in the system' }}</p>
          </div>
        </div>
      </div>
    </div>

    @if (loadingCustomer()) {
      <div class="card"><div class="card-body text-center py-5">
        <div class="spinner-border" style="color: var(--primary-light);" role="status"></div>
        <p class="mt-3 text-muted">Loading customer data...</p>
      </div></div>
    } @else {
      <form (ngSubmit)="onSubmit()">
        <!-- Personal Information -->
        <div class="section-card">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h3>Personal Information</h3>
          </div>
          <div class="section-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Full Name <span class="required">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" placeholder="Enter full name" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email <span class="required">*</span></label>
                <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" placeholder="customer@example.com" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Password @if (!editMode()) { <span class="required">*</span> }</label>
                <input type="password" class="form-control" [(ngModel)]="formData.password" name="password" [placeholder]="editMode() ? 'Leave blank to keep current' : 'Enter password'" [required]="!editMode()" />
                @if (editMode()) {
                  <small class="text-muted">Leave empty to keep current password</small>
                }
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone <span class="required">*</span></label>
                <input type="tel" class="form-control" [(ngModel)]="formData.phone" name="phone" placeholder="+880 1XXXXXXXXX" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Gender <span class="required">*</span></label>
                <select class="form-select" [(ngModel)]="formData.gender" name="gender" required>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Occupation <span class="required">*</span></label>
                <select class="form-select" [(ngModel)]="formData.occupation" name="occupation" required>
                  <option value="">Select occupation</option>
                  @for (occ of occupations; track occ) {
                    <option [value]="occ">{{ occ.replace('_', ' ') | titlecase }}</option>
                  }
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Date of Birth</label>
                <input type="date" class="form-control" [(ngModel)]="formData.dob" name="dob" />
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Photo -->
        <div class="section-card mt-4">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <h3>Profile Photo</h3>
          </div>
          <div class="section-body">
            <div class="d-flex align-items-center gap-4">
              <div class="profile-preview">
                @if (profilePreview()) {
                  <img [src]="profilePreview()" alt="Profile preview" />
                } @else {
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                }
              </div>
              <div>
                <label class="btn btn-outline-primary btn-sm" for="profile-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  Choose Photo
                </label>
                <input type="file" id="profile-upload" class="d-none" accept="image/*" (change)="onProfileSelect($event)" />
                @if (profileFile()) {
                  <span class="ms-2 text-muted small">{{ profileFile()!.name }}</span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div class="section-card mt-4">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <h3>Addresses</h3>
          </div>
          <div class="section-body">
            @for (addr of formData.addresses; track $index; let i = $index) {
              <div class="address-item">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="address-label">Address {{ i + 1 }}</span>
                  @if (formData.addresses.length > 1) {
                    <button type="button" class="btn-remove" (click)="removeAddress(i)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      Remove
                    </button>
                  }
                </div>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Holding No</label>
                    <input type="text" class="form-control" [(ngModel)]="addr.holdingNo" [name]="'holdingNo_' + i" placeholder="e.g. 12/A" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Area / Street</label>
                    <input type="text" class="form-control" [(ngModel)]="addr.area" [name]="'area_' + i" placeholder="e.g. Gulshan-2" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Postal Code</label>
                    <input type="text" class="form-control" [(ngModel)]="addr.postalCode" [name]="'postalCode_' + i" placeholder="e.g. 1212" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Address Type</label>
                    <select class="form-select" [(ngModel)]="addr.addressType" [name]="'addressType_' + i">
                      <option value="">Select type</option>
                      <option value="PERMANENT">Permanent</option>
                      <option value="PRESENT">Present</option>
                    </select>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Police Station</label>
                    <select class="form-select" [(ngModel)]="addr.policeStation.id" [name]="'policeStation_' + i">
                      <option value="">Select police station</option>
                      @for (ps of policeStations(); track ps.id) {
                        <option [value]="ps.id">{{ ps.name }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>
            }
            <button type="button" class="btn-add" (click)="addAddress()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              Add Address
            </button>
          </div>
        </div>

        <!-- KYC Documents -->
        <div class="section-card mt-4">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <h3>KYC Documents</h3>
          </div>
          <div class="section-body">
            @for (kyc of formData.kycRequests; track $index; let i = $index) {
              <div class="kyc-item">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="address-label">Document {{ i + 1 }}</span>
                  <button type="button" class="btn-remove" (click)="removeKyc(i)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    Remove
                  </button>
                </div>
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="form-label">Document Type</label>
                    <select class="form-select" [(ngModel)]="kyc.doc_type" [name]="'doc_type_' + i">
                      <option value="">Select document</option>
                      <option value="NID">National ID (NID)</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Upload Document</label>
                    <div class="file-upload-box">
                      <input type="file" class="d-none" [id]="'kyc-file-' + i" accept=".pdf,.jpg,.jpeg,.png" (change)="onKycFileSelect($event, i)" />
                      <label class="file-upload-label" [for]="'kyc-file-' + i">
                        @if (kycFiles()[i]) {
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          <span class="ms-2">{{ kycFiles()[i]!.name }}</span>
                        } @else {
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                          <span class="ms-2 text-muted">Click to upload (PDF, JPG, PNG)</span>
                        }
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            }
            <button type="button" class="btn-add" (click)="addKyc()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              Add Document
            </button>
          </div>
        </div>

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="alert alert-danger mt-4 d-flex align-items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ errorMessage() }}
          </div>
        }

        <!-- Actions -->
        <div class="d-flex justify-content-end gap-3 mt-4 mb-5">
          <a routerLink="/customers" class="btn btn-outline-secondary">Cancel</a>
          <button type="submit" class="btn btn-primary d-flex align-items-center gap-2" [disabled]="submitting()">
            @if (submitting()) {
              <div class="spinner-border spinner-border-sm" role="status"></div>
              {{ editMode() ? 'Updating...' : 'Creating...' }}
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
              {{ editMode() ? 'Update Customer' : 'Create Customer' }}
            }
          </button>
        </div>
      </form>
    }
  `,
  styles: [`
    .btn-back {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-secondary);
      transition: all 0.15s;
    }
    .btn-back:hover {
      background: var(--bg);
      color: var(--text-primary);
      border-color: var(--text-muted);
    }

    .section-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: #FAFBFC;
    }
    .section-header h3 {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }
    .section-header svg {
      color: var(--primary-light);
      flex-shrink: 0;
    }
    .section-body {
      padding: 20px;
    }

    .required {
      color: var(--danger);
    }

    .form-label {
      font-size: 12px;
      letter-spacing: 0.02em;
    }

    .profile-preview {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      border: 2px dashed var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: var(--bg);
      flex-shrink: 0;
    }
    .profile-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .address-item, .kyc-item {
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #FAFBFC;
      margin-bottom: 12px;
    }
    .address-item:last-of-type, .kyc-item:last-of-type {
      margin-bottom: 0;
    }

    .address-label {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 13px;
      color: var(--text-primary);
    }

    .btn-remove {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: none;
      background: none;
      color: var(--danger);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .btn-remove:hover {
      background: #FEE2E2;
    }

    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px dashed var(--primary-light);
      background: transparent;
      color: var(--primary-light);
      font-size: 13px;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      justify-content: center;
      transition: all 0.15s;
      margin-top: 12px;
    }
    .btn-add:hover {
      background: rgba(37, 99, 235, 0.06);
      border-style: solid;
    }

    .file-upload-box {
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .file-upload-label {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      cursor: pointer;
      font-size: 13px;
      min-height: 42px;
    }
    .file-upload-label:hover {
      background: #F8FAFC;
    }

    .spinner-border {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .alert {
      border-radius: 10px;
      font-size: 13px;
    }

    .form-control::placeholder {
      color: var(--text-muted);
    }
  `]
})
export class CustomerFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editMode = signal(false);
  customerId = signal<number | null>(null);
  loadingCustomer = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  profilePreview = signal<string | null>(null);
  profileFile = signal<File | null>(null);
  policeStations = signal<any[]>([]);
  kycFiles = signal<(File | null)[]>([]);

  formData: any = {
    email: '',
    password: '',
    name: '',
    gender: '',
    phone: '',
    occupation: '',
    dob: '',
    addresses: [this.createEmptyAddress()],
    kycRequests: [],
  };

  occupations = [
    'STUDENT', 'SERVICE_HOLDER', 'GOVERNMENT_EMPLOYEE', 'BUSINESS_OWNER',
    'SELF_EMPLOYED', 'FREELANCER', 'DOCTOR', 'ENGINEER', 'TEACHER',
    'LAWYER', 'ACCOUNTANT', 'ARCHITECT', 'CONSULTANT', 'FARMER',
    'LABORER', 'DRIVER', 'MECHANIC', 'ELECTRICIAN', 'PLUMBER',
    'POLICE', 'MILITARY', 'CIVIL_SERVANT', 'BANKER', 'NGO_EMPLOYEE',
    'RETIRED', 'HOMEMAKER', 'UNEMPLOYED', 'FOREIGN_EMPLOYEE',
    'EXPATRIATE', 'POLITICIAN', 'JOURNALIST', 'ARTIST', 'WRITER',
    'ACTOR', 'MUSICIAN', 'RELIGIOUS_LEADER', 'OTHERS'
  ];

  ngOnInit() {
    this.loadPoliceStations();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.customerId.set(Number(id));
      this.loadCustomer(Number(id));
    }
  }

  createEmptyAddress() {
    return { holdingNo: '', area: '', postalCode: '', addressType: '', policeStation: { id: '' } };
  }

  loadPoliceStations() {
    this.http.get<any[]>(`${environment.apiUrl}/policestation/`).subscribe({
      next: (data) => this.policeStations.set(data),
      error: () => {},
    });
  }

  loadCustomer(id: number) {
    this.loadingCustomer.set(true);
    this.http.get<any>(`${environment.apiUrl}/customer/${id}`).subscribe({
      next: (data) => {
        if (data) {
          this.formData.name = data.name || '';
          this.formData.email = data.email || '';
          this.formData.phone = data.phone || '';
          this.formData.gender = data.gender || '';
          this.formData.occupation = data.occupation || '';
          this.formData.dob = data.dob ? data.dob.substring(0, 10) : '';
          this.formData.password = '';

          if (data.addresses && data.addresses.length > 0) {
            this.formData.addresses = data.addresses.map((a: any) => ({
              holdingNo: a.holdingNo || '',
              area: a.area || '',
              postalCode: a.postalCode || '',
              addressType: a.addressType || '',
              policeStation: { id: a.policeStation?.id || '' },
            }));
          } else {
            this.formData.addresses = [this.createEmptyAddress()];
          }

          if (data.kycRequests && data.kycRequests.length > 0) {
            this.formData.kycRequests = data.kycRequests.map((k: any) => ({
              doc_type: k.doc_type || '',
              path: '',
            }));
            this.kycFiles.set(new Array(data.kycRequests.length).fill(null));
          }

          if (data.profile) {
            this.profilePreview.set(data.profile);
          }
        }
        this.loadingCustomer.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load customer data.');
        this.loadingCustomer.set(false);
      },
    });
  }

  onProfileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.profileFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.profilePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onKycFileSelect(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const updated = [...this.kycFiles()];
      updated[index] = input.files[0];
      this.kycFiles.set(updated);
    }
  }

  addAddress() {
    this.formData.addresses = [...this.formData.addresses, this.createEmptyAddress()];
  }

  removeAddress(index: number) {
    this.formData.addresses = this.formData.addresses.filter((_: any, i: number) => i !== index);
  }

  addKyc() {
    this.formData.kycRequests = [...this.formData.kycRequests, { doc_type: '', path: '' }];
    this.kycFiles.set([...this.kycFiles(), null]);
  }

  removeKyc(index: number) {
    this.formData.kycRequests = this.formData.kycRequests.filter((_: any, i: number) => i !== index);
    this.kycFiles.set(this.kycFiles().filter((_: any, i: number) => i !== index));
  }

  onSubmit() {
    if (this.submitting()) return;

    if (!this.formData.name || !this.formData.email || !this.formData.phone || !this.formData.gender || !this.formData.occupation) {
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    if (!this.editMode() && !this.formData.password) {
      this.errorMessage.set('Password is required for new customers.');
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    const customerData: any = {
      name: this.formData.name,
      email: this.formData.email,
      phone: this.formData.phone,
      gender: this.formData.gender,
      occupation: this.formData.occupation,
      dob: this.formData.dob || null,
      addresses: this.formData.addresses
        .filter((a: any) => a.holdingNo || a.area || a.postalCode || a.addressType || a.policeStation.id)
        .map((a: any) => ({
          holdingNo: a.holdingNo,
          area: a.area,
          postalCode: a.postalCode,
          addressType: a.addressType || null,
          policeStation: a.policeStation.id ? { id: Number(a.policeStation.id) } : null,
        })),
      kycRequests: this.formData.kycRequests
        .filter((k: any) => k.doc_type)
        .map((k: any) => ({
          doc_type: k.doc_type,
          path: '',
        })),
    };

    if (!this.editMode()) {
      customerData.password = this.formData.password;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(customerData));

    if (this.profileFile()) {
      formData.append('profile', this.profileFile()!);
    }

    if (!this.editMode()) {
      const kycFiles = this.kycFiles();
      this.formData.kycRequests.forEach((kyc: any, i: number) => {
        if (kyc.doc_type && kycFiles[i]) {
          formData.append(kyc.doc_type, kycFiles[i]!);
        }
      });
    }

    const id = this.customerId();
    const request$ = this.editMode()
      ? this.http.put<any>(`${environment.apiUrl}/customer/${id}`, formData)
      : this.http.post<any>(`${environment.apiUrl}/customer/`, formData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.error?.message) {
          this.errorMessage.set(err.error.message);
        } else if (err.status === 0) {
          this.errorMessage.set('Cannot connect to server. Please try again.');
        } else {
          this.errorMessage.set('An error occurred. Please check all fields and try again.');
        }
      },
    });
  }
}