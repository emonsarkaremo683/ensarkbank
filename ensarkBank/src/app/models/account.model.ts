import { AccountType, AccountStatus, HolderType } from './enums';

export interface AccountRequest {
  accountType: AccountType;
  availableBalance: number;
  branchId: number;
  accountStatus: AccountStatus;
  accountHolders: AccountHolderRequest[];
}

export interface AccountHolderRequest {
  holderType: HolderType;
  canWithdraw: boolean;
  canDeposit: boolean;
  canApproveTransaction: boolean;
  customerId: number;
}

export interface AccountResponse {
  accountNumber: string;
  accountType: AccountType;
  accountStatus: AccountStatus;
  availableBalance: number;
  currentBalance: number;
  holdBalance: number;
  branchName: string;
  holderResponses: AccountHolderResponse[];
}

export interface AccountHolderResponse {
  accountHolderName: string;
  holderType: HolderType;
  canWithdraw: boolean;
  canDeposit: boolean;
  canApproveTransaction: boolean;
}