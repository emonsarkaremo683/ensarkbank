import { LoanStatus } from './enums';

export interface LoanApplicationRequest {
  accountId: number;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
}

export interface LoanApplicationResponse {
  loanId: number;
  accountId: number;
  accountNumber: string;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  emiAmount: number;
  totalPayable: number;
  outstandingBalance: number;
  status: LoanStatus;
  applicationDate: string;
  approvalDate: string;
  disbursementDate: string;
  nextDueDate: string;
  rejectionReason: string;
  disbursementTransactionRef: string;
}
