import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService, AddressService } from '../../services';
import { CustomerRequest, PoliceStation, AddressRequest, Division, District, DocumentType, Gender, CustomerOccupation } from '../../models';

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

  divisions = signal<Division[]>([]);
  districts = signal<District[]>([]);
  allPoliceStations = signal<PoliceStation[]>([]);
  sameAddress = signal(false);
  profileFile?: File;
  kycUploads = signal<{ file?: File; doc_type: DocumentType }[]>([{ doc_type: 'NID' }]);
  loading = signal(false);
  error = signal('');

  genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
  occupations: CustomerOccupation[] = [
    'STUDENT', 'SERVICE_HOLDER', 'GOVERNMENT_EMPLOYEE', 'BUSINESS_OWNER',
    'SELF_EMPLOYED', 'FREELANCER', 'DOCTOR', 'ENGINEER', 'TEACHER', 'LAWYER',
    'ACCOUNTANT', 'ARCHITECT', 'CONSULTANT', 'FARMER', 'LABORER', 'DRIVER',
    'MECHANIC', 'ELECTRICIAN', 'PLUMBER', 'POLICE', 'MILITARY', 'CIVIL_SERVANT',
    'BANKER', 'NGO_EMPLOYEE', 'RETIRED', 'HOMEMAKER', 'UNEMPLOYED',
    'FOREIGN_EMPLOYEE', 'EXPATRIATE', 'POLITICIAN', 'JOURNALIST', 'ARTIST',
    'WRITER', 'ACTOR', 'MUSICIAN', 'RELIGIOUS_LEADER', 'OTHERS'
  ];
  addressTypes = ['PRESENT', 'PERMANENT'];
  documentTypes: DocumentType[] = ['NID', 'PASSPORT', 'DRIVING_LICENSE', 'BIRTH_CERTIFICATE'];

  ngOnInit() {
    this.loadAddressData();
    this.initializeAddresses();
  }

  private loadAddressData() {
    this.addressService.getAllDivisions().subscribe({ next: (data) => this.divisions.set(data), error: () => { } });
    this.addressService.getAllDistricts().subscribe({ next: (data) => this.districts.set(data), error: () => { } });
    this.addressService.getAllPoliceStations().subscribe({ next: (data) => this.allPoliceStations.set(data), error: () => { } });
  }

  private initializeAddresses() {
    this.customer.addresses = [
      { holdingNo: '', area: '', postalCode: '', addressType: 'PRESENT', divisionId: 0, districtId: 0, policeStationId: 0, policeStation: { id: 0 } },
      { holdingNo: '', area: '', postalCode: '', addressType: 'PERMANENT', divisionId: 0, districtId: 0, policeStationId: 0, policeStation: { id: 0 } }
    ];
  }

  addAddress() {
    this.customer.addresses.push({
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
    this.customer.addresses.splice(index, 1);
  }

  onDivisionChange(index: number, divisionId: number) {
    const address = this.customer.addresses[index];

    address.divisionId = divisionId;
    address.districtId = 0;
    address.policeStationId = 0;
    address.policeStation = { id: 0 };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  onDistrictChange(index: number, districtId: number) {
    const address = this.customer.addresses[index];

    address.districtId = districtId;
    address.policeStationId = 0;
    address.policeStation = { id: 0 };

    if (this.sameAddress() && index === 0) {
      this.copyPresentToPermanent();
    }
  }

  onPoliceStationChange(index: number, policeStationId: number) {
    const address = this.customer.addresses[index];

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
    const [present, permanent] = this.customer.addresses;
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

  handleKycFileChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const uploads = [...this.kycUploads()];
    uploads[index] = { ...uploads[index], file: input.files[0] };
    this.kycUploads.set(uploads);
  }

  updateKycDocType(index: number, type: DocumentType) {
    const uploads = [...this.kycUploads()];
    uploads[index] = { ...uploads[index], doc_type: type };
    this.kycUploads.set(uploads);
  }

  addKycFile() {
    this.kycUploads.set([...this.kycUploads(), { doc_type: 'NID' }]);
  }

  removeKycFile(index: number) {
    const uploads = [...this.kycUploads()];
    uploads.splice(index, 1);
    this.kycUploads.set(uploads);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    const addresses = this.customer.addresses.map(({ divisionId, districtId, policeStationId, policeStation, ...rest }) => ({
      ...rest,
      addressType: rest.addressType,
      policeStation: { id: policeStationId || policeStation?.id || 0 }
    }));

    const payload: CustomerRequest = {
      ...this.customer,
      addresses,
      kycRequests: this.kycUploads()
        .filter((upload) => upload.file)
        .map((upload) => ({ doc_type: upload.doc_type, path: upload.file?.name ?? '' }))
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (this.profileFile) {
      formData.append('profile', this.profileFile, this.profileFile.name);
    }

    this.kycUploads().forEach((upload) => {
      if (upload.file) {
        formData.append('kycFiles', upload.file, upload.file.name);
      }
    });

    this.customerService.create(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/customers']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
