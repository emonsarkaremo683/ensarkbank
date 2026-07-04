import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService, BranchService, AddressService } from '../../services';
import { EmployeeRequest, Branch, PoliceStation, AddressRequest, Division, District } from '../../models';

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
  divisions = signal<Division[]>([]);
  districts = signal<District[]>([]);
  allPoliceStations = signal<PoliceStation[]>([]);
  sameAddress = signal(false);
  profileFile?: File;
  loading = signal(false);
  error = signal('');

  genders = ['MALE', 'FEMALE', 'OTHER'];
  designations = ['MANAGING_DIRECTOR', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'TELLER', 'CASH_OFFICER', 'CUSTOMER_SERVICE_OFFICER', 'SOFTWARE_ENGINEER', 'HR_OFFICER', 'ACCOUNTS_OFFICER', 'LOAN_OFFICER', 'AUDIT_OFFICER', 'ADMIN_OFFICER', 'INTERN'];
  roles = ['ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'LOAN_OFFICER', 'CUSTOMER_SERVICE', 'CUSTOMER'];
  addressTypes = ['PRESENT', 'PERMANENT'];

  ngOnInit() {
    this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
    this.loadAddressData();
    this.initializeAddresses();
  }

  private loadAddressData() {
    this.addressService.getAllDivisions().subscribe({ next: (data) => this.divisions.set(data), error: () => { } });
    this.addressService.getAllDistricts().subscribe({ next: (data) => this.districts.set(data), error: () => { } });
    this.addressService.getAllPoliceStations().subscribe({ next: (data) => this.allPoliceStations.set(data), error: () => { } });
  }

  private initializeAddresses() {
    this.employee.addresses = [
      { holdingNo: '', area: '', postalCode: '', addressType: 'PRESENT', divisionId: 0, districtId: 0, policeStationId: 0, policeStation: { id: 0 } },
      { holdingNo: '', area: '', postalCode: '', addressType: 'PERMANENT', divisionId: 0, districtId: 0, policeStationId: 0, policeStation: { id: 0 } }
    ];
  }

  addAddress() {
    this.employee.addresses.push({
      holdingNo: '',
      area: '',
      postalCode: '',
      addressType: 'PRESENT',
      divisionId: 0,
      districtId: 0,
      policeStationId: 0,
      policeStation: { id: 0 }
    });
  }

  removeAddress(index: number) {
    this.employee.addresses.splice(index, 1);
  }

  onDivisionChange(index: number, divisionId: number) {
    const address = this.employee.addresses[index];

    address.divisionId = divisionId;
    address.districtId = 0;
    address.policeStationId = 0;
    address.policeStation = { id: 0 };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  onDistrictChange(index: number, districtId: number) {
    const address = this.employee.addresses[index];

    address.districtId = districtId;
    address.policeStationId = 0;
    address.policeStation = { id: 0 };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  onPoliceStationChange(index: number, policeStationId: number) {
    const address = this.employee.addresses[index];

    address.policeStationId = policeStationId;
    address.policeStation = {
      id: policeStationId
    };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }
  getDistrictsForAddress(address: AddressRequest): District[] {
    if (!address.divisionId) {
      return [];
    }

    return this.districts().filter(
      district => district.division?.id === address.divisionId
    );
  }

  getPoliceStationsForAddress(address: AddressRequest): PoliceStation[] {
    if (!address.districtId) {
      return [];
    }

    return this.allPoliceStations().filter(
      ps => ps.district?.id === address.districtId
    );
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
    permanent.divisionId = present.divisionId;
    permanent.districtId = present.districtId;
    permanent.policeStationId = present.policeStationId;
    permanent.policeStation = { id: present.policeStationId || present.policeStation?.id || 0 };
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

    const addresses = this.employee.addresses.map(({ divisionId, districtId, policeStationId, policeStation, ...rest }) => ({
      ...rest,
      addressType: rest.addressType,
      policeStation: { id: policeStationId || policeStation?.id || 0 }
    }));

    const payload: EmployeeRequest = {
      ...this.employee,
      addresses
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (this.profileFile) {
      formData.append('profile', this.profileFile, this.profileFile.name);
    }

    this.employeeService.create(formData).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/employees']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
