export interface History {
    id: number;
    transactionId: string;
    particulars:string;
    entryType: 'CREDIT' | 'DEBIT';
    amount: number;
    date: string; // ISO 8601 format
}