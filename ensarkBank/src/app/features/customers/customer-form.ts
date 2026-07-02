import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services';
import { AddressService } from '../../services';
import { CustomerRequest, PoliceStation, AddressRequest } from '../../models';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss'
})
export class CustomerForm implements OnInit {
  private customerService = inject(CustomerService);
  private addressService = inject(AddressService);
  private router = inject(Router);

  customer: CustomerRequest = {
    email: '',
    password: '',
    name: '',
    gender: 'MALE',
    phone: '',
    occupation: 'STUDENT',
    dob: '',
    addresses: [],
    kycRequests: []
  };

  policeStations = signal<PoliceStation[]>([]);
  loading = signal(false);
  error = signal('');

  genders = ['MALE', 'FEMALE', 'OTHER'];
  occupations = ['STUDENT', 'SERVICE_HOLDER', 'GOVERNMENT_EMPLOYEE', 'BUSINESS_OWNER', 'SELF_EMPLOYED', 'FREELANCER', 'DOCTOR', 'ENGINEER', 'TEACHER', 'LAWYER', 'ACCOUNTANT', 'FARMER', 'OTHERS'];
  addressTypes = ['PRESENT', 'PERMANENT'];

  ngOnInit() {
    this.addressService.getAllPoliceStations().subscribe({
      next: (data) => this.policeStations.set(data),
      error: () => {}
    });
    this.addAddress();
  }

  addAddress() {
    this.customer.addresses.push({ holdingNo: '', area: '', postalCode: '', addressType: 'PRESENT', policeStation: { id: 0 } });
  }

  removeAddress(index: number) {
    this.customer.addresses.splice(index, 1);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.customer));
    this.customerService.create(formData).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/customers']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
