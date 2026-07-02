import { Gender, CustomerOccupation } from './enums';
import { AddressRequest, AddressResponse } from './employee.model';

export interface CustomerRequest {
  email: string;
  password: string;
  name: string;
  gender: Gender;
  phone: string;
  occupation: CustomerOccupation;
  dob: string;
  profile?: string;
  addresses: AddressRequest[];
  kycRequests: KycRequest[];
}

export interface CustomerResponse {
  id?: number;
  email: string;
  role: string;
  emailVerified: boolean;
  active: boolean;
  name: string;
  gender: Gender;
  phone: string;
  occupation: CustomerOccupation;
  dob: string;
  profile: string;
  addresses: AddressResponse[];
  documents: KycDocResponse[];
}

export interface KycRequest {
  path: string;
  doc_type: string;
}

export interface KycDocResponse {
  path: string;
  doc_type: string;
}