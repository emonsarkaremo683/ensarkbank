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
  RepaymentStatus,
  Designation,
  HolderType,
  EntryType,
  BeneficiaryType,
  ATMTransactionType,
  ATMStatus,
  BranchType,
  BranchStatus,
  NomineeRelation,
  KYCStatus,
  RequestStatus,
  CardSettingsRequestType,
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
  id?: number;
  name: string;
  divisionId: number;
}

export interface PoliceStation {
  id?: number;
  name: string;
  districtId: number;
}

// Branch
export interface Branch {
  id: number;
  name: string;
  branchCode: string;
  type: BranchType;
  status: BranchStatus;
  email: string;
  phoneNumber: string;
  address?: string;
  routingNumber?: string;
  parentBranch?: { id: number; name?: string };
  parentBranchId?: number;
  policeStation?: { id: number; name?: string };
  policeStationId?: number;
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
  imageUrl?: string;
  addresses: AddressResponse[];
  documents?: KycResponse[];
  kycStatus?: KYCStatus;
}

export interface KycRequest {
  path: string;
  doc_type: DocumentType;
}

export interface KycResponse {
  id: number;
  path: string;
  doc_type: DocumentType;
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
  user_id: number;
  name: string;
  email: string;
  gender: Gender;
  phone: string;
  designation: Designation;
  dob: string;
  role: Role;
  isEmailVerified?: boolean;
  active?: boolean;
  branchName: string;
  profile?: string;
  imageUrl?: string;
  addresses: AddressResponse[];
}

// Account
export interface AccountRequest {
  accountType: AccountType;
  availableBalance: number;
  branchId: number;
  n_name?: string;
  n_email?: string;
  n_phone?: string;
  relation?: NomineeRelation;
  accountHolders: AccountHolderRequest[];
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
  branchRoutingNumber: string;
  n_name?: string;
  n_email?: string;
  n_phone?: string;
  relation?: NomineeRelation;
  n_photo?: string;
  n_nid_front?: string;
  n_nid_back?: string;
  holderResponses: AccountHolderResponse[];
}

export interface AccountHolderRequest {
  holderType: HolderType;
  canWithdraw: boolean;
  canDeposit: boolean;
  canApproveTransaction: boolean;
  customerId: number;
}

export interface AccountHolderResponse {
  id: number;
  accountHolderName: string;
  holderType: HolderType;
  canWithdraw: boolean;
  canDeposit: boolean;
  canApproveTransaction: boolean;
}

// Beneficiary
export interface BeneficiaryRequest {
  accNumber: string;
  name: string;
  provider?: string;
  routingNumber?: string;
  beneficiaryType: BeneficiaryType;
  customerId: number;
}

export interface BeneficiaryResponse {
  id: number;
  accNumber: string;
  name: string;
  provider?: string;
  routingNumber?: string;
  beneficiaryType: BeneficiaryType;
  customerId: number;
  customerName: string;
}

// Transactions
export interface TransactionRequest {
  amount: number;
  remarks?: string;
}

export interface AccountTransactionRequest {
  senderAccountId?: number;
  receiverAccountId?: number;
  receiverAccountNumber?: string;
  receiverName?: string;
  bankName?: string;
  routingNumber?: string;
  beneficiaryId?: number;
  request: TransactionRequest;
}

export interface AccountTransactionResponse {
  id: number;
  transactionId: string;
  senderAccountNumber: string;
  senderName?: string;
  receiverAccountNumber?: string;
  receiverName?: string;
  bankName?: string;
  direction?: string;
  response?: TransactionResponse;
}

export interface OtpInitiateResponse {
  otpReferenceId: number;
  maskedEmail: string;
  expiresAt: string;
}

export interface TransactionResponse {
  transactionId: string;
  referenceNo?: string;
  transactionType: TransactionType;
  channel: TransactionChannel;
  status: TransactionStatus;
  amount: number;
  chargeAmount?: number;
  vatAmount?: number;
  remarks?: string;
  createdAt?: string;
  journals?: JournalResponse[];
}

export interface OtpVerifyRequest {
  otpReferenceId: number;
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
  counterpartyAccountNumber?: string;
  counterpartyName?: string;
  entryType: EntryType;
  amount: number;
  particulars?: string;
  transactionType?: string;
  channel?: string;
  status?: string;
  remarks?: string;
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
  loanId: number;
  accountId: number;
  accountNumber: string;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  emiAmount: number;
  totalPayable: number;
  outstandingBalance?: number;
  status: LoanStatus;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  nextDueDate?: string;
  rejectionReason?: string;
  disbursementTransactionRef?: string;
}

export interface LoanRepayment {
  id: number;
  loanId: number;
  installmentNumber: number;
  dueDate: string;
  principalComponent: number;
  interestComponent: number;
  emiAmount: number;
  remainingBalanceAfter: number;
  status: RepaymentStatus;
  paidDate?: string;
  transactionRef?: string;
}

// Card
export interface CardRequest {
  accountId: number;
  cardNetwork: CardNetwork;
  cardType: CardType;
  pin: string;
  internationalEnabled?: boolean;
  onlineTransactionEnabled?: boolean;
}

export interface CardResponse {
  cardId: number;
  cardNumber: string;
  cardType: CardType;
  cardNetwork: CardNetwork;
  status: CardStatus;
  cardHolderName: string;
  accountNumber: string;
  dailyLimit: number;
  monthlyLimit: number;
  expiryDate: string;
  cvv?: string;
  isInternationalEnabled: boolean;
  isOnlineTransactionEnabled?: boolean;
  createdAt?: string;
}

export interface CardSettingsRequest {
  id: number;
  cardId: number;
  cardNumber?: string;
  cardHolderName?: string;
  requestType: CardSettingsRequestType;
  requestedValue: boolean;
  status: RequestStatus;
  rejectionReason?: string;
  requestedById?: number;
  requestedByName?: string;
  createdAt?: string;
}

// ATM
export interface ATMRequest {
  status?: ATMStatus;
  balance: number;
  limit: number;
  address?: string;
  branchId?: number;
}

export interface ATMResponse {
  atmId: number;
  status: ATMStatus;
  availableBalance: number;
  limit: number;
  branchName: string;
  address?: string;
  routingNumber?: string;
  accNumber?: string;
  type?: string;
  accountStatus?: string;
}

export interface ATMTransactionRequest {
  atmId: number;
  cardNumber: string;
  transactionType: ATMTransactionType;
  pin: string;
  transactionRequest: TransactionRequest;
}

export interface ATMTransactionResponse {
  ATMTransactionId: number;
  transactionType: ATMTransactionType;
  cardNumber: string;
  address?: string;
  transactionResponse?: TransactionResponse;
}

export interface BalanceCheckRequest {
  cardNumber: string;
  pin: string;
}

// Cashier Transaction
export interface CashierTransactionRequest {
  checkNo?: string;
  branchId: number;
  accountNumber: string;
  accountName?: string;
  type?: TransactionType;
  bankName?: string;
  employeeId?: number;
  routingNumber?: string;
  transactionRequest: TransactionRequest;
}

export interface JournalResponse {
  id: number;
  date?: string;
  transactionId: string;
  particulars?: string;
  accountNumber: string;
  counterpartyAccountNumber?: string;
  counterpartyName?: string;
  entryType: EntryType;
  amount: number;
  transactionType?: TransactionType;
  channel?: TransactionChannel;
  status?: TransactionStatus;
  remarks?: string;
}

export interface CashierTransactionResponse {
  id: number;
  checkNo?: string;
  cashierName: string;
  branchName: string;
  transaction?: TransactionResponse;
  journals?: JournalResponse[];
}

// Reports
export interface ReportRequest {
  branchId?: number;
  fromDate: string;
  toDate: string;
  role?: string;
  userBranchId?: number;
}

export interface TrialBalanceResponse {
  branchId?: number;
  branchName: string;
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
  branchId?: number;
  branchName: string;
  accountNumber: string;
  openingBalance: number;
  closingBalance: number;
  entries: LedgerLine[];
}

export interface LedgerLine {
  journalId: number;
  date: string;
  transactionId?: string;
  particulars: string;
  accountNumber?: string;
  accountName?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheetResponse {
  branchId?: number;
  branchName: string;
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  totalAssets?: number;
  totalLiabilitiesAndEquity?: number;
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

export interface DashboardStats {
  totalAccounts: number;
  totalCustomers: number;
  totalTransactions: number;
  totalLoans: number;
  totalBalance: number;
  totalActiveCards: number;
  transactionTrends: TimeSeriesPoint[];
  accountTypeDistribution: LabelValue[];
  loanStatusDistribution: LabelValue[];
  transactionTypeDistribution: LabelValue[];
  transactionStatusDistribution: LabelValue[];
  branchWiseSummary: BranchSummary[];
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
  totalAmount: number;
}

export interface LabelValue {
  label: string;
  value: number;
  totalAmount: number;
}

export interface BranchSummary {
  branchId: number;
  branchName: string;
  accountCount: number;
  customerCount: number;
  transactionCount: number;
  totalBalance: number;
  loanCount: number;
}
