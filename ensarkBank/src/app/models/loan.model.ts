import { LoanStatus, RepaymentStatus } from './enums';

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

export interface LoanRepaymentResponse {
  id: number;
  installmentNumber: number;
  dueDate: string;
  principalComponent: number;
  interestComponent: number;
  emiAmount: number;
  remainingBalanceAfter: number;
  status: RepaymentStatus;
  paidDate: string;
  transactionRef: string;
}
