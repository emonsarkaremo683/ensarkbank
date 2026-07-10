import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { EmployeeService, BranchService, AddressService } from '../../services';
import {
  EmployeeRequest,
  Branch,
  PoliceStation,
  AddressRequest,
  Division,
  District,
  Gender,
  Designation,
  Role,
} from '../../models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, RouterLink, TitleCasePipe],
  templateUrl: './employee-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './employee-form.scss',
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
    addresses: [],
  };

  branches = signal<Branch[]>([]);
  divisions = signal<Division[]>([]);
  districts = signal<District[]>([]);
  allPoliceStations = signal<PoliceStation[]>([]);
  sameAddress = signal(false);
  profileFile?: File;
  loading = signal(false);
  error = signal('');

  selectedDivisions: number[] = [0, 0];
  selectedDistricts: number[] = [0, 0];

  genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
  designations: Designation[] = [
    'CHIEF_EXECUTIVE_OFFICER',
    'MANAGING_DIRECTOR',
    'DEPUTY_MANAGING_DIRECTOR',
    'GENERAL_MANAGER',
    'DEPUTY_GENERAL_MANAGER',
    'ASSISTANT_GENERAL_MANAGER',
    'BRANCH_MANAGER',
    'ASSISTANT_BRANCH_MANAGER',
    'OPERATIONS_MANAGER',
    'TELLER',
    'CASH_OFFICER',
    'CUSTOMER_SERVICE_OFFICER',
    'RELATIONSHIP_MANAGER',
    'LOAN_OFFICER',
    'ACCOUNTS_OFFICER',
    'COMPLIANCE_OFFICER',
    'AUDIT_OFFICER',
    'SYSTEM_ADMINISTRATOR',
    'SOFTWARE_ENGINEER',
    'NETWORK_ENGINEER',
    'DATABASE_ADMINISTRATOR',
    'HR_OFFICER',
    'ADMIN_OFFICER',
    'FINANCE_OFFICER',
    'TREASURY_OFFICER',
    'SECURITY_OFFICER',
    'OFFICE_ASSISTANT',
    'INTERN',
  ];
  roles: Role[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'BRANCH_MANAGER',
    'ACCOUNTANT',
    'CASHIER',
    'LOAN_OFFICER',
    'CUSTOMER_SERVICE',
    'ATM_MANAGER',
    'AUDITOR',
    'CUSTOMER',
  ];
  addressTypes = ['PRESENT', 'PERMANENT'];

  ngOnInit() {
    this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
    this.loadAddressData();
    this.initializeAddresses();
  }

  private loadAddressData() {
    this.addressService
      .getAllDivisions()
      .subscribe({ next: (data) => this.divisions.set(data), error: () => {} });
    this.addressService
      .getAllDistricts()
      .subscribe({ next: (data) => this.districts.set(data), error: () => {} });
    this.addressService
      .getAllPoliceStations()
      .subscribe({ next: (data) => this.allPoliceStations.set(data), error: () => {} });
  }

  private initializeAddresses() {
    this.employee.addresses = [
      { holdingNo: '', area: '', postalCode: '', addressType: 'PRESENT', policeStation: { id: 0 } },
      {
        holdingNo: '',
        area: '',
        postalCode: '',
        addressType: 'PERMANENT',
        policeStation: { id: 0 },
      },
    ];
  }

  addAddress() {
    this.employee.addresses.push({
      holdingNo: '',
      area: '',
      postalCode: '',
      addressType: 'PRESENT',
      policeStation: { id: 0 },
    });
  }

  removeAddress(index: number) {
    this.employee.addresses.splice(index, 1);
  }

  onDivisionChange(index: number, divisionId: number) {
    this.selectedDivisions[index] = divisionId;
    this.selectedDistricts[index] = 0;
    this.employee.addresses[index].policeStation = { id: 0 };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  onDistrictChange(index: number, districtId: number) {
    this.selectedDistricts[index] = districtId;
    this.employee.addresses[index].policeStation = { id: 0 };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  onPoliceStationChange(index: number, policeStationId: number) {
    this.employee.addresses[index].policeStation = { id: policeStationId };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  getDistrictsForIndex(index: number): District[] {
    const divisionId = this.selectedDivisions[index];
    if (!divisionId) return [];
    return this.districts().filter((d) => d.division?.id === divisionId);
  }

  getPoliceStationsForIndex(index: number): PoliceStation[] {
    const districtId = this.selectedDistricts[index];
    if (!districtId) return [];
    return this.allPoliceStations().filter((ps) => ps.district?.id === districtId);
  }

  toggleSameAddress() {
    const next = !this.sameAddress();
    this.sameAddress.set(next);
    if (next) {
      this.copyPresentToPermanent();
    }
  }

  private copyPresentToPermanent() {
    const [present, permanent] = this.employee.addresses;
    permanent.holdingNo = present.holdingNo;
    permanent.area = present.area;
    permanent.postalCode = present.postalCode;
    permanent.policeStation = { id: present.policeStation?.id || 0 };
    this.selectedDivisions[1] = this.selectedDivisions[0];
    this.selectedDistricts[1] = this.selectedDistricts[0];
  }

  handleProfileFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.profileFile = input.files[0];
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    const payload: EmployeeRequest = {
      ...this.employee,
      addresses: this.employee.addresses.map((addr) => ({
        holdingNo: addr.holdingNo,
        area: addr.area,
        postalCode: addr.postalCode,
        addressType: addr.addressType,
        policeStation: { id: addr.policeStation?.id || 0 },
      })),
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (this.profileFile) {
      formData.append('profile', this.profileFile, this.profileFile.name);
    }

    this.employeeService.create(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
