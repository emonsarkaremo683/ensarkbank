export interface ReportRequest {
  branchId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface LedgerLineResponse {
  journalId: number;
  date: string;
  transactionId: string;
  particulars: string;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerResponse {
  branchId: number;
  branchName: string;
  accountNumber: string;
  openingBalance: number;
  closingBalance: number;
  entries: LedgerLineResponse[];
}

export interface TrialBalanceLineResponse {
  glCode: string;
  accountName: string;
  accountNumber: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  branchId: number;
  branchName: string;
  lines: TrialBalanceLineResponse[];
  totalDebit: number;
  totalCredit: number;
}

export interface BalanceSheetSectionLine {
  glCode: string;
  accountName: string;
  amount: number;
}

export interface BalanceSheetSection {
  title: string;
  lines: BalanceSheetSectionLine[];
  total: number;
}

export interface BalanceSheetResponse {
  branchId: number;
  branchName: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}
