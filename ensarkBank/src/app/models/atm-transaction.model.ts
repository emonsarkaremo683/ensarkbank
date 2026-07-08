import { ATMTransactionType, TransactionType, TransactionChannel, TransactionStatus, EntryType } from './enums';
import { TransactionResponse, JournalResponse } from './transaction.model';

export type { ATMTransactionType };

export interface ATMTransactionRequest {
  atmId: number;
  cardNumber?: string;
  transactionType: ATMTransactionType;
  pin?: string;
  transactionRequest: {
    transactionType: TransactionType;
    channel: TransactionChannel;
    amount: number;
    remarks?: string;
  };
}

export interface ATMTransactionResponse {
  ATMTransactionId: number;
  transactionType: ATMTransactionType;
  cardNumber?: string;
  address?: string;
  transactionResponse: TransactionResponse;
}

export interface RefillRequest {
  atmId: number;
  amount: number;
}

export const ATM_TRANSACTION_TYPES: {
  value: ATMTransactionType;
  label: string;
  icon: string;
  color: string;
  description: string;
}[] = [
  {
    value: 'CASH_WITHDRAW',
    label: 'Cash Withdrawal',
    icon: '↗',
    color: '#dc3545',
    description: 'Withdraw cash from your account'
  },
  {
    value: 'CASH_DEPOSIT',
    label: 'Cash Deposit',
    icon: '↘',
    color: '#198754',
    description: 'Deposit cash into your account'
  },
  {
    value: 'REFILL',
    label: 'Vault Refill',
    icon: '⛽',
    color: '#0d6efd',
    description: 'Replenish the ATM vault (manager)'
  }
];

export function getTransactionStatusClass(status?: TransactionStatus): string {
  switch (status) {
    case 'SUCCESS': return 'badge-green';
    case 'FAILED': return 'badge-red';
    case 'PENDING': return 'badge-yellow';
    case 'CANCELLED': return 'badge-light';
    case 'REVERSED': return 'badge-blue';
    default: return 'badge-light';
  }
}

export function getTxTypeColor(type?: ATMTransactionType): string {
  switch (type) {
    case 'CASH_WITHDRAW': return '#dc3545';
    case 'CASH_DEPOSIT': return '#198754';
    case 'REFILL': return '#0d6efd';
    default: return '#667eea';
  }
}
