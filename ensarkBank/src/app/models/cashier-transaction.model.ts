import { TransactionRequest, AccountTransactionResponse, TransactionResponse, JournalResponse } from './transaction.model';

export interface CashierTransactionRequest {
  checkNo: string;
  branchId: number;
  accountNumber: string;
  accountName: string;
  bankName:string;
  transactionRequest: TransactionRequest;
}

export interface CashierTransactionResponse {
  id: number;
  checkNo: string;
  cashierName: string;
  branchName: string;
  accountTransaction: AccountTransactionResponse;
  transaction: TransactionResponse;
  journals: JournalResponse[];
}
