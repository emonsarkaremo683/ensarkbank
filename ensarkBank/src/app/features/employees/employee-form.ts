import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services';
import { BranchService } from '../../services';
import { AddressService } from '../../services';
import { EmployeeRequest, Branch, PoliceStation } from '../../models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.scss'
})
export class EmployeeForm implements OnInit {
  private employeeService = inject(EmployeeService);
  private branchService = inject(BranchService);
  private addressService = inject(AddressService);
  private router = inject(Router);

  employee: EmployeeRequest = {
    email: '',
    password: '',
    role: 'CASHIER',
    branchId: 0,
    name: '',
    gender: 'MALE',
    phone: '',
    designation: 'TELLER',
    dob: '',
    addresses: []
  };

  branches = signal<Branch[]>([]);
  policeStations = signal<PoliceStation[]>([]);
  loading = signal(false);
  error = signal('');

  genders = ['MALE', 'FEMALE', 'OTHER'];
  designations = ['MANAGING_DIRECTOR', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'TELLER', 'CASH_OFFICER', 'CUSTOMER_SERVICE_OFFICER', 'SOFTWARE_ENGINEER', 'HR_OFFICER', 'ACCOUNTS_OFFICER', 'LOAN_OFFICER', 'AUDIT_OFFICER', 'ADMIN_OFFICER', 'INTERN'];
  roles = ['ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'LOAN_OFFICER', 'CUSTOMER_SERVICE', 'CUSTOMER'];
  addressTypes = ['PRESENT', 'PERMANENT'];

  ngOnInit() {
    this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
    this.addressService.getAllPoliceStations().subscribe({ next: (data) => this.policeStations.set(data) });
    this.addAddress();
  }

  addAddress() {
    this.employee.addresses.push({ holdingNo: '', area: '', postalCode: '', addressType: 'PRESENT', policeStation: { id: 0 } });
  }

  removeAddress(index: number) {
    this.employee.addresses.splice(index, 1);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.employee));
    this.employeeService.create(formData).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/employees']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
