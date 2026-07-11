import {
  Gender,
  CustomerOccupation,
  AddressType,
  DocumentType,
  Role,
  AccountType,
  AccountStatus,
  TransactionType,
  TransactionStatus,
  TransactionChannel,
  CardType,
  CardStatus,
  CardNetwork,
  LoanType,
  LoanStatus,
  Designation,
  HolderType,
  EntryType,
  BeneficiaryType,
  ATMTransactionType,
  ATMStatus,
  BranchType,
  BranchStatus,
} from '../enums/role.enum';

// Auth models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: any;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  gender?: Gender;
  occupation?: CustomerOccupation;
  dob?: string;
  profile?: string;
  imageUrl?: string;
  isEmailVerified?: boolean;
  active?: boolean;
  designation?: Designation;
  branchId?: number;
  branchName?: string;
  addresses?: AddressResponse[];
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Address models
export interface AddressRequest {
  holdingNo?: string;
  area?: string;
  postalCode?: string;
  addressType: AddressType;
  policeStation: { id: number };
}

export interface AddressResponse {
  id: number;
  holdingNo?: string;
  area?: string;
  postalCode?: string;
  addressType: AddressType;
  policeStationName: string;
}

// Division/District/PoliceStation
export interface Division {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  divisionId: number;
}

export interface PoliceStation {
  id: number;
  name: string;
  districtId: number;
}

// Branch
export interface Branch {
  id: number;
  branchName: string;
  branchCode: string;
  branchType: BranchType;
  status: BranchStatus;
  email: string;
  phone: string;
  address?: AddressResponse;
}

// Customer
export interface CustomerRequest {
  email: string;
  password?: string;
  name: string;
  gender: Gender;
  phone: string;
  occupation?: CustomerOccupation;
  dob: string;
  profile?: string;
  addresses: AddressRequest[];
  kycRequests?: KycRequest[];
}

export interface CustomerResponse {
  id: number;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  active: boolean;
  name: string;
  gender: Gender;
  phone: string;
  occupation: CustomerOccupation;
  dob: string;
  profile?: string;
  addresses: AddressResponse[];
  documents?: KycResponse[];
}

export interface KycRequest {
  path: string;
  doc_type: DocumentType;
}

export interface KycResponse {
  id: number;
  path: string;
  docType: DocumentType;
  verified: boolean;
}

// Employee
export interface EmployeeRequest {
  email: string;
  password?: string;
  role?: Role;
  branchId: number;
  name: string;
  gender: Gender;
  phone: string;
  designation: Designation;
  dob: string;
  profile?: string;
  addresses: AddressRequest[];
}

export interface EmployeeResponse {
  id: number;
  userId: number;
  name: string;
  email: string;
  gender: Gender;
  phone: string;
  designation: Designation;
  dob: string;
  role: Role;
  branchId: number;
  branchName: string;
  profile?: string;
  addresses: AddressResponse[];
}

// Account
export interface AccountRequest {
  accountType: AccountType;
  initialBalance: number;
  branchId: number;
  status?: AccountStatus;
  nomineeName?: string;
  nomineePhone?: string;
  nomineeRelation?: string;
  accountHolders: AccountHolderRequest[];
}

export interface AccountResponse {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  branchId: number;
  branchName: string;
  nomineeName?: string;
  nomineePhone?: string;
  nomineeRelation?: string;
  holders: AccountHolderResponse[];
  createdAt: string;
}

export interface AccountHolderRequest {
  holderType: HolderType;
  permissions: string[];
  customerId: number;
}

export interface AccountHolderResponse {
  id: number;
  name: string;
  holderType: HolderType;
  permissions: string[];
  customerId: number;
}

// Beneficiary
export interface BeneficiaryRequest {
  accountNumber: string;
  name: string;
  provider?: string;
  routingNumber?: string;
  beneficiaryType: BeneficiaryType;
  customerId: number;
}

export interface BeneficiaryResponse {
  id: number;
  accountNumber: string;
  name: string;
  provider?: string;
  routingNumber?: string;
  beneficiaryType: BeneficiaryType;
  customerName: string;
}

// Transactions
export interface TransactionRequest {
  type: TransactionType;
  channel: TransactionChannel;
  amount: number;
  remarks?: string;
}

export interface AccountTransactionRequest {
  senderAccountNumber?: string;
  senderCardNumber?: string;
  receiverAccountNumber?: string;
  receiverCardNumber?: string;
  beneficiaryId?: number;
  transactionRequest: TransactionRequest;
}

export interface AccountTransactionResponse {
  id: number;
  transactionId: string;
  senderAccountNumber: string;
  receiverAccountNumber?: string;
  amount: number;
  type: TransactionType;
  channel: TransactionChannel;
  status: TransactionStatus;
  remarks?: string;
  createdAt: string;
}

export interface OtpInitiateResponse {
  otpReferenceId: string;
  maskedEmail: string;
  expiresAt: string;
}

export interface OtpVerifyRequest {
  otpReferenceId: string;
  otpCode: string;
}

// Transaction
export interface Transaction {
  id: number;
  transactionId: string;
  type: TransactionType;
  channel: TransactionChannel;
  amount: number;
  status: TransactionStatus;
  remarks?: string;
  branchId: number;
  createdAt: string;
}

// Journal
export interface JournalEntry {
  id: number;
  transactionId: string;
  accountNumber: string;
  entryType: EntryType;
  amount: number;
  particulars?: string;
  date: string;
}

// Loan
export interface LoanApplicationRequest {
  accountId: number;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
}

export interface LoanResponse {
  id: number;
  accountId: number;
  accountNumber: string;
  loanType: LoanType;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalPayable: number;
  totalInterest: number;
  status: LoanStatus;
  disbursedAt?: string;
  maturityDate?: string;
  createdAt: string;
}

export interface LoanRepayment {
  id: number;
  installmentNumber: number;
  principalPart: number;
  interestPart: number;
  totalPaid: number;
  dueDate: string;
  paidDate?: string;
  status: string;
}

// Card
export interface CardRequest {
  accountId: number;
  network: CardNetwork;
  type: CardType;
  pin: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface CardResponse {
  id: number;
  cardNumber: string;
  cardType: CardType;
  cardNetwork: CardNetwork;
  status: CardStatus;
  cardHolderName: string;
  accountNumber: string;
  dailyLimit: number;
  monthlyLimit: number;
  expiryDate: string;
  createdAt: string;
}

// ATM
export interface ATMRequest {
  status?: ATMStatus;
  balance: number;
  dailyLimit: number;
  address: AddressRequest;
  branchId: number;
}

export interface ATMResponse {
  id: number;
  atmCode: string;
  status: ATMStatus;
  balance: number;
  dailyLimit: number;
  branchId: number;
  branchName: string;
  address?: AddressResponse;
  createdAt: string;
}

export interface ATMTransactionRequest {
  atmId: number;
  cardNumber: string;
  type: ATMTransactionType;
  pin: string;
  transactionRequest: TransactionRequest;
}

export interface ATMTransactionResponse {
  id: number;
  transactionId: string;
  atmId: number;
  cardNumber: string;
  type: ATMTransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
}

export interface BalanceCheckRequest {
  cardNumber: string;
  pin: string;
}

// Cashier Transaction
export interface CashierTransactionRequest {
  chequeLeafNumber?: string;
  branchId: number;
  accountNumber: string;
  transactionRequest: TransactionRequest;
}

export interface CashierTransactionResponse {
  id: number;
  transactionId: string;
  chequeLeafNumber?: string;
  accountNumber: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  cashierName: string;
  branchName: string;
  createdAt: string;
}

// Reports
export interface ReportRequest {
  branchId?: number;
  fromDate: string;
  toDate: string;
}

export interface TrialBalanceResponse {
  branchName: string;
  branchCode: string;
  fromDate: string;
  toDate: string;
  lines: TrialBalanceLine[];
  totalDebit: number;
  totalCredit: number;
}

export interface TrialBalanceLine {
  glCode: string;
  accountName: string;
  accountNumber: string;
  debit: number;
  credit: number;
}

export interface LedgerResponse {
  branchName: string;
  accountNumber: string;
  accountName: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  closingBalance: number;
  lines: LedgerLine[];
}

export interface LedgerLine {
  journalId: number;
  date: string;
  particulars: string;
  entryType: EntryType;
  amount: number;
  runningBalance: number;
}

export interface BalanceSheetResponse {
  asOfDate: string;
  branchName: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  isBalanced: boolean;
}

export interface BalanceSheetSection {
  title: string;
  lines: BalanceSheetSectionLine[];
  total: number;
}

export interface BalanceSheetSectionLine {
  glCode: string;
  accountName: string;
  amount: number;
}
