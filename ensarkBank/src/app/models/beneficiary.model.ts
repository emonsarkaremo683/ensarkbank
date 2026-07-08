import { BeneficiaryType } from './enums';

export interface BeneficiaryRequest {
  accNumber: string;
  name: string;
  provider: string;
  beneficiaryType: BeneficiaryType;
  customerId: number;
}

export interface BeneficiaryResponse {
  accNumber: string;
  name: string;
  provider: string;
  beneficiaryType: BeneficiaryType;
  customerId: number;
  customerName: string;
}