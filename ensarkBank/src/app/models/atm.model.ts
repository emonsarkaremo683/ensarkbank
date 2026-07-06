import { ATMStatus, AccountType, AccountStatus } from './enums';

export interface ATMRequest {
  status: ATMStatus;
  balance: number;
  limit: number;
  address: string;
  branchId: number;
}

export interface ATMResponse {
  atmId: number;
  status: ATMStatus;
  limit: number;
  address: string;
  routingNumber: string;
  accNumber: string;
  type: AccountType;
  accountStatus: AccountStatus;
  availableBalance: number;
  branchName: string;
}
