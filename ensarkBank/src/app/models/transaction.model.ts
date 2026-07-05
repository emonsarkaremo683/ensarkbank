import { TransactionType, TransactionChannel, TransactionStatus, EntryType } from './enums';

export interface AccountTransactionRequest {
  senderId: number;
  receiverId?: number;
  receiverAccountNumber: string;
  receiverName: string;
  bankName: string;
  beneficiaryId?: number;
  request: TransactionRequest;
}

export interface TransactionRequest {
  transactionType: TransactionType;
  channel: TransactionChannel;
  amount: number;
  remarks?: string;
}

export interface AccountTransactionResponse {
  id: number;
  transactionId: string;
  senderAccountNumber: string;
  senderName: string;
  receiverAccountNumber: string;
  receiverName: string;
  bankName: string;
  direction: string;
  response: TransactionResponse;
}

export interface TransactionResponse {
  transactionId: string;
  referenceNo: string;
  transactionType: TransactionType;
  channel: TransactionChannel;
  status: TransactionStatus;
  amount: number;
  chargeAmount: number;
  vatAmount: number;
  remarks: string;
  journals: JournalResponse[];
}

export interface JournalResponse {
  accountName: string;
  accountNumber: string;
  entryType: EntryType;
  amount: number;
}