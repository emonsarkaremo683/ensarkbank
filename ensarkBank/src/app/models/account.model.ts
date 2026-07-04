import { AccountType, AccountStatus, HolderType } from './enums';

export interface AccountRequest {
  accountType: AccountType;
  availableBalance: number;
  branchId: number;
  accountStatus: AccountStatus;
  n_name: string;
  n_email: string;
  n_phone: string;
  n_photo: string;
  n_nid_front: string;
  n_nid_back: string;
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
  id: number;
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
