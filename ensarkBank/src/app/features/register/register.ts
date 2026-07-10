import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { ToastService } from '../../services/toast.service';
import { Gender, CustomerOccupation } from '../../models/enums';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register.scss',
})
export class Register {
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private toast = inject(ToastService);

  step = signal(1);

  email = signal('');
  password = signal('');
  name = signal('');
  gender = signal<Gender>('MALE');
  phone = signal('');
  occupation = signal<CustomerOccupation>('SERVICE_HOLDER');
  dob = signal('');

  profileFile = signal<File | null>(null);
  nidFile = signal<File | null>(null);
  passportFile = signal<File | null>(null);
  drivingLicenseFile = signal<File | null>(null);
  birthCertificateFile = signal<File | null>(null);

  // Present address
  presHoldingNo = signal('');
  presArea = signal('');
  presPostalCode = signal('');

  // Permanent address
  permHoldingNo = signal('');
  permArea = signal('');
  permPostalCode = signal('');
  sameAsPresent = signal(false);

  loading = signal(false);

  genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
  occupations: CustomerOccupation[] = [
    'SERVICE_HOLDER', 'GOVERNMENT_EMPLOYEE', 'BUSINESS_OWNER', 'SELF_EMPLOYED',
    'FREELANCER', 'DOCTOR', 'ENGINEER', 'TEACHER', 'LAWYER', 'ACCOUNTANT',
    'FARMER', 'STUDENT', 'HOMEMAKER', 'UNEMPLOYED', 'OTHERS',
  ];

  onFileChange(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      switch (field) {
        case 'profile': this.profileFile.set(file); break;
        case 'NID': this.nidFile.set(file); break;
        case 'PASSPORT': this.passportFile.set(file); break;
        case 'DRIVING_LICENSE': this.drivingLicenseFile.set(file); break;
        case 'BIRTH_CERTIFICATE': this.birthCertificateFile.set(file); break;
      }
    }
  }

  nextStep() {
    if (this.step() === 1) {
      if (!this.email() || !this.password() || !this.name() || !this.phone() || !this.dob()) {
        this.toast.warning('Please fill in all required fields');
        return;
      }
      if (!this.presArea()) {
        this.toast.warning('Please fill in your present address');
        return;
      }
    }
    this.step.update((s) => s + 1);
  }

  prevStep() {
    this.step.update((s) => s - 1);
  }

  private buildDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toISOString();
  }

  onSubmit() {
    if (this.loading()) return;

    const addresses: any[] = [
      {
        holdingNo: this.presHoldingNo(),
        area: this.presArea(),
        postalCode: this.presPostalCode(),
        addressType: 'PRESENT',
      },
    ];

    if (this.sameAsPresent()) {
      addresses.push({
        holdingNo: this.presHoldingNo(),
        area: this.presArea(),
        postalCode: this.presPostalCode(),
        addressType: 'PERMANENT',
      });
    } else {
      addresses.push({
        holdingNo: this.permHoldingNo(),
        area: this.permArea(),
        postalCode: this.permPostalCode(),
        addressType: 'PERMANENT',
      });
    }

    const formData = new FormData();
    const data = {
      email: this.email(),
      password: this.password(),
      name: this.name(),
      gender: this.gender(),
      phone: this.phone(),
      occupation: this.occupation(),
      dob: this.buildDate(this.dob()),
      addresses,
      kycRequests: [],
    };
    formData.append('data', JSON.stringify(data));

    const profile = this.profileFile();
    if (profile) formData.append('profile', profile, profile.name);

    const nid = this.nidFile();
    if (nid) formData.append('NID', nid, nid.name);
    const passport = this.passportFile();
    if (passport) formData.append('PASSPORT', passport, passport.name);
    const dl = this.drivingLicenseFile();
    if (dl) formData.append('DRIVING_LICENSE', dl, dl.name);
    const bc = this.birthCertificateFile();
    if (bc) formData.append('BIRTH_CERTIFICATE', bc, bc.name);

    this.loading.set(true);
    this.customerService.create(formData).subscribe({
      next: () => {
        this.toast.success('Registration successful! Check your email to verify.');
        this.router.navigateByUrl('/verify-email-sent');
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || err.message || 'Registration failed');
      },
    });
  }
}
