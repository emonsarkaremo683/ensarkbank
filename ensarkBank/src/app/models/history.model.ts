export interface History {
    transactionId: string;
    accountName: string;
    accountNumber: string;
    entryType: 'credit' | 'debit';
    channel: 'ATM' | 'Online' | 'Branch' | 'Mobile';
    amount: number;
    date: string; // ISO 8601 format
}