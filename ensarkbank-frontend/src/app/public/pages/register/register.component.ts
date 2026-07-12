import { Component, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Division, District, PoliceStation } from '../../../core/models';
import { Gender, CustomerOccupation, CustomerOccupationLabels, AddressType, DocumentType } from '../../../core/enums/role.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  currentStep = signal(1);
  totalSteps = 4;
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  personalForm!: FormGroup;
  permanentAddressForm!: FormGroup;
  presentAddressForm!: FormGroup;
  kycForm!: FormGroup;
  securityForm!: FormGroup;

  sameAsPermanent = signal(false);

  divisions: Division[] = [];
  presentDistricts: District[] = [];
  presentPoliceStations: PoliceStation[] = [];


  permanentDistricts: District[] = [];
  permanentPoliceStations: PoliceStation[] = [];

  isLoadingLocations = signal(false);

  genderOptions = Object.values(Gender);
  occupationOptions = Object.values(CustomerOccupation);
  occupationLabels = CustomerOccupationLabels;

  selectedProfileFile = signal<File | null>(null);
  selectedNidFile = signal<File | null>(null);
  selectedPassportFile = signal<File | null>(null);
  selectedDrivingLicenseFile = signal<File | null>(null);
  selectedBirthCertFile = signal<File | null>(null);

  profilePreview = signal<string | null>(null);

  steps = [
    { label: 'Personal', icon: '👤' },
    { label: 'Addresses', icon: '📍' },
    { label: 'KYC Documents', icon: '📄' },
    { label: 'Security', icon: '🔐' }
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadDivision();
  }

  private initForms(): void {
    this.personalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+880|880|0)?1[3-9]\d{8}$/)]],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      occupation: ['']
    });

    this.permanentAddressForm = this.fb.group({
      divisionId: ['', Validators.required],
      districtId: ['', Validators.required],
      policeStationId: ['', Validators.required],
      postalCode: [''],
      holdingNo: [''],
      area: ['']
    });

    this.presentAddressForm = this.fb.group({
      divisionId: ['', Validators.required],
      districtId: ['', Validators.required],
      policeStationId: ['', Validators.required],
      postalCode: [''],
      holdingNo: [''],
      area: ['']
    });

    this.kycForm = this.fb.group({});

    this.securityForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get currentForm(): FormGroup {
    switch (this.currentStep()) {
      case 1: return this.personalForm;
      case 2: return this.permanentAddressForm;
      case 3: return this.kycForm;
      case 4: return this.securityForm;
      default: return this.personalForm;
    }
  }


  loadDivision(): void {
    this.apiService.getDivision().subscribe({
      next: (data) => {
        this.divisions = data;
        this.cdr.markForCheck();

      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onDivisionChange(event: Event): void {
    const divisionId = Number(
      (event.target as HTMLSelectElement).value
    );

    this.loadPermanentDistricts(divisionId);
  }



  loadDistrictByDivisionId(id: number) {
    this.apiService.getDistrictsByDivisionId(id).subscribe({
      next: (data) => {
        this.presentDistricts = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  loadPoliceStationByDistrictId(id: number) {
    this.apiService.getPoliceStationByDistrictId(id).subscribe({
      next: (data) => {
        this.presentPoliceStations = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadPermanentDistricts(divisionId: number) {
    this.apiService.getDistrictsByDivisionId(divisionId).subscribe({
      next: (data) => {
        this.permanentDistricts = data;
        this.permanentAddressForm.patchValue({ districtId: '', policeStationId: '' });
        this.permanentPoliceStations = [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadPermanentPoliceStations(districtId: number) {
    this.apiService.getPoliceStationByDistrictId(districtId).subscribe({
      next: (data) => {
        this.permanentPoliceStations = data;
        this.permanentAddressForm.patchValue({ policeStationId: '' });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadPresentDistricts(divisionId: number) {
    this.apiService.getDistrictsByDivisionId(divisionId).subscribe({
      next: (data) => {
        this.presentDistricts = data;
        this.presentAddressForm.patchValue({ districtId: '', policeStationId: '' });
        this.presentPoliceStations = [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadPresentPoliceStations(districtId: number) {
    this.apiService.getPoliceStationByDistrictId(districtId).subscribe({
      next: (data) => {
        this.presentPoliceStations = data;
        this.presentAddressForm.patchValue({ policeStationId: '' });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onPermanentDistrictChange(districtId: number): void {
    this.loadPermanentPoliceStations(districtId);
  }

  onPresentDivisionChange(divisionId: number): void {
    this.loadPresentDistricts(divisionId);
  }

  onPresentDistrictChange(districtId: number): void {
    this.loadPresentPoliceStations(districtId);
  }

  toggleSameAsPermanent(): void {
    this.sameAsPermanent.update(v => !v);
  }



  onProfileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedProfileFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.profilePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onNidSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedNidFile.set(input.files[0]);
    }
  }

  onPassportSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPassportFile.set(input.files[0]);
    }
  }

  onDrivingLicenseSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedDrivingLicenseFile.set(input.files[0]);
    }
  }

  onBirthCertSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedBirthCertFile.set(input.files[0]);
    }
  }

  removeFile(type: string): void {
    switch (type) {
      case 'profile': this.selectedProfileFile.set(null); this.profilePreview.set(null); break;
      case 'nid': this.selectedNidFile.set(null); break;
      case 'passport': this.selectedPassportFile.set(null); break;
      case 'drivingLicense': this.selectedDrivingLicenseFile.set(null); break;
      case 'birthCert': this.selectedBirthCertFile.set(null); break;
    }
  }

  nextStep(): void {
    if (this.currentStep() === 2) {
      if (this.permanentAddressForm.invalid) {
        this.permanentAddressForm.markAllAsTouched();
        return;
      }
      if (!this.sameAsPermanent() && this.presentAddressForm.invalid) {
        this.presentAddressForm.markAllAsTouched();
        return;
      }
    } else {
      const form = this.currentForm;
      if (form.invalid) {
        form.markAllAsTouched();
        return;
      }
    }
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const permRaw = this.permanentAddressForm.getRawValue();
    const presentRaw = this.presentAddressForm.getRawValue();

    const addresses = [
      {
        holdingNo: permRaw.holdingNo || null,
        area: permRaw.area || null,
        postalCode: permRaw.postalCode || null,
        addressType: AddressType.PERMANENT,
        policeStation: { id: permRaw.policeStationId }
      }
    ];

    if (!this.sameAsPermanent()) {
      addresses.push({
        holdingNo: presentRaw.holdingNo || null,
        area: presentRaw.area || null,
        postalCode: presentRaw.postalCode || null,
        addressType: AddressType.PRESENT,
        policeStation: { id: presentRaw.policeStationId }
      });
    } else {
      addresses.push({
        holdingNo: permRaw.holdingNo || null,
        area: permRaw.area || null,
        postalCode: permRaw.postalCode || null,
        addressType: AddressType.PRESENT,
        policeStation: { id: permRaw.policeStationId }
      });
    }

    const customerData = {
      email: this.personalForm.value.email,
      password: this.securityForm.value.password,
      name: this.personalForm.value.name,
      gender: this.personalForm.value.gender,
      phone: this.personalForm.value.phone,
      occupation: this.personalForm.value.occupation || null,
      dob: this.personalForm.value.dob,
      addresses: addresses
    };

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(customerData)], { type: 'application/json' }));

    if (this.selectedProfileFile()) {
      formData.append('profile', this.selectedProfileFile()!);
    }
    if (this.selectedNidFile()) {
      formData.append('NID', this.selectedNidFile()!);
    }
    if (this.selectedPassportFile()) {
      formData.append('PASSPORT', this.selectedPassportFile()!);
    }
    if (this.selectedDrivingLicenseFile()) {
      formData.append('DRIVING_LICENSE', this.selectedDrivingLicenseFile()!);
    }
    if (this.selectedBirthCertFile()) {
      formData.append('BIRTH_CERTIFICATE', this.selectedBirthCertFile()!);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.notification.success('Registration Successful', 'Your account has been created. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || err.error?.error || 'Registration failed. Please try again.';
        this.notification.error('Registration Failed', message);
      }
    });
  }

  getOccupationLabel(value: string): string {
    return CustomerOccupationLabels[value as CustomerOccupation] || value;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }
}
