import { Gender, Designation, Role } from './enums';

export interface EmployeeRequest {
  email: string;
  password: string;
  role: Role;
  branchId: number;
  name: string;
  gender: Gender;
  phone: string;
  designation: Designation;
  dob: string;
  profile?: string;
  addresses: AddressRequest[];
}

export interface EmployeeResponse {
  user_id: number;
  email: string;
  password: string;
  role: Role;
  emailVerified: boolean;
  active: boolean;
  id: number;
  name: string;
  gender: Gender;
  phone: string;
  designation: Designation;
  dob: string;
  profile: string;
  branchName: string;
  addresses: AddressResponse[];
}

export interface AddressRequest {
  holdingNo: string;
  area: string;
  postalCode: string;
  addressType: string;
  policeStation: { id: number };
}

export interface AddressResponse {
  holdingNo: string;
  area: string;
  postalCode: string;
  addressType: string;
  policeStationName: string;
}