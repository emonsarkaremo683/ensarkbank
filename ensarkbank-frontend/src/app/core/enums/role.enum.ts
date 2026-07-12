// ===========================
// Role
// ===========================
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  CASHIER = 'CASHIER',
  LOAN_OFFICER = 'LOAN_OFFICER',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  ATM_MANAGER = 'ATM_MANAGER',
  AUDITOR = 'AUDITOR',
  CUSTOMER = 'CUSTOMER'
}

export const RoleLabels: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.BRANCH_MANAGER]: 'Branch Manager',
  [Role.ACCOUNTANT]: 'Accountant',
  [Role.CASHIER]: 'Cashier',
  [Role.LOAN_OFFICER]: 'Loan Officer',
  [Role.CUSTOMER_SERVICE]: 'Customer Service',
  [Role.ATM_MANAGER]: 'ATM Manager',
  [Role.AUDITOR]: 'Auditor',
  [Role.CUSTOMER]: 'Customer'
};

// ===========================
// Gender
// ===========================
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

// ===========================
// CustomerOccupation
// ===========================
export enum CustomerOccupation {
  STUDENT = 'STUDENT',
  SERVICE_HOLDER = 'SERVICE_HOLDER',
  GOVERNMENT_EMPLOYEE = 'GOVERNMENT_EMPLOYEE',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  FREELANCER = 'FREELANCER',
  DOCTOR = 'DOCTOR',
  ENGINEER = 'ENGINEER',
  TEACHER = 'TEACHER',
  LAWYER = 'LAWYER',
  ACCOUNTANT = 'ACCOUNTANT',
  ARCHITECT = 'ARCHITECT',
  CONSULTANT = 'CONSULTANT',
  FARMER = 'FARMER',
  LABORER = 'LABORER',
  DRIVER = 'DRIVER',
  MECHANIC = 'MECHANIC',
  ELECTRICIAN = 'ELECTRICIAN',
  PLUMBER = 'PLUMBER',
  POLICE = 'POLICE',
  MILITARY = 'MILITARY',
  CIVIL_SERVANT = 'CIVIL_SERVANT',
  BANKER = 'BANKER',
  NGO_EMPLOYEE = 'NGO_EMPLOYEE',
  RETIRED = 'RETIRED',
  HOMEMAKER = 'HOMEMAKER',
  UNEMPLOYED = 'UNEMPLOYED',
  FOREIGN_EMPLOYEE = 'FOREIGN_EMPLOYEE',
  EXPATRIATE = 'EXPATRIATE',
  POLITICIAN = 'POLITICIAN',
  JOURNALIST = 'JOURNALIST',
  ARTIST = 'ARTIST',
  WRITER = 'WRITER',
  ACTOR = 'ACTOR',
  MUSICIAN = 'MUSICIAN',
  RELIGIOUS_LEADER = 'RELIGIOUS_LEADER',
  OTHERS = 'OTHERS'
}

export const CustomerOccupationLabels: Record<CustomerOccupation, string> = {
  [CustomerOccupation.STUDENT]: 'Student',
  [CustomerOccupation.SERVICE_HOLDER]: 'Service Holder',
  [CustomerOccupation.GOVERNMENT_EMPLOYEE]: 'Government Employee',
  [CustomerOccupation.BUSINESS_OWNER]: 'Business Owner',
  [CustomerOccupation.SELF_EMPLOYED]: 'Self Employed',
  [CustomerOccupation.FREELANCER]: 'Freelancer',
  [CustomerOccupation.DOCTOR]: 'Doctor',
  [CustomerOccupation.ENGINEER]: 'Engineer',
  [CustomerOccupation.TEACHER]: 'Teacher',
  [CustomerOccupation.LAWYER]: 'Lawyer',
  [CustomerOccupation.ACCOUNTANT]: 'Accountant',
  [CustomerOccupation.ARCHITECT]: 'Architect',
  [CustomerOccupation.CONSULTANT]: 'Consultant',
  [CustomerOccupation.FARMER]: 'Farmer',
  [CustomerOccupation.LABORER]: 'Laborer',
  [CustomerOccupation.DRIVER]: 'Driver',
  [CustomerOccupation.MECHANIC]: 'Mechanic',
  [CustomerOccupation.ELECTRICIAN]: 'Electrician',
  [CustomerOccupation.PLUMBER]: 'Plumber',
  [CustomerOccupation.POLICE]: 'Police',
  [CustomerOccupation.MILITARY]: 'Military',
  [CustomerOccupation.CIVIL_SERVANT]: 'Civil Servant',
  [CustomerOccupation.BANKER]: 'Banker',
  [CustomerOccupation.NGO_EMPLOYEE]: 'NGO Employee',
  [CustomerOccupation.RETIRED]: 'Retired',
  [CustomerOccupation.HOMEMAKER]: 'Homemaker',
  [CustomerOccupation.UNEMPLOYED]: 'Unemployed',
  [CustomerOccupation.FOREIGN_EMPLOYEE]: 'Foreign Employee',
  [CustomerOccupation.EXPATRIATE]: 'Expatriate',
  [CustomerOccupation.POLITICIAN]: 'Politician',
  [CustomerOccupation.JOURNALIST]: 'Journalist',
  [CustomerOccupation.ARTIST]: 'Artist',
  [CustomerOccupation.WRITER]: 'Writer',
  [CustomerOccupation.ACTOR]: 'Actor',
  [CustomerOccupation.MUSICIAN]: 'Musician',
  [CustomerOccupation.RELIGIOUS_LEADER]: 'Religious Leader',
  [CustomerOccupation.OTHERS]: 'Others'
};

// ===========================
// AddressType
// ===========================
export enum AddressType {
  PERMANENT = 'PERMANENT',
  PRESENT = 'PRESENT'
}

// ===========================
// DocumentType
// ===========================
export enum DocumentType {
  NID = 'NID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE'
}

// ===========================
// AccountType
// ===========================
export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  FIXED_DEPOSIT = 'FIXED_DEPOSIT',
  JOINT_ACCOUNT = 'JOINT_ACCOUNT',
  STUDENT = 'STUDENT',
  BUSINESS = 'BUSINESS'
  
}

export const AccountTypeLabels: Record<string, string> = {
  SAVINGS: 'Savings',
  CURRENT: 'Current',
  FIXED_DEPOSIT: 'Fixed Deposit',
  JOINT_ACCOUNT: 'Joint Account',
  STUDENT: 'Student',
  BUSINESS: 'Business'
};

// ===========================
// AccountStatus
// ===========================
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED',
  FREEZE = 'FREEZE',
  PENDING = 'PENDING'
}

// ===========================
// TransactionType
// ===========================
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  ATM_WITHDRAW = 'ATM_WITHDRAW',
  ATM_DEPOSIT = 'ATM_DEPOSIT',
  LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT = 'LOAN_REPAYMENT'
}

// ===========================
// TransactionStatus
// ===========================
export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED'
}

// ===========================
// TransactionChannel
// ===========================
export enum TransactionChannel {
  BRANCH = 'BRANCH',
  ATM = 'ATM',
  INTERNET_BANKING = 'INTERNET_BANKING',
  MOBILE_BANKING = 'MOBILE_BANKING',
  POS = 'POS',
  E_COMMERCE = 'E_COMMERCE',
  QR_PAYMENT = 'QR_PAYMENT',
  CARD = 'CARD',
  BEFTN = 'BEFTN',
  NPSB = 'NPSB',
  RTGS = 'RTGS',
  SWIFT = 'SWIFT',
  AGENT_BANKING = 'AGENT_BANKING',
  API = 'API',
  SYSTEM = 'SYSTEM'
}

// ===========================
// KYCStatus
// ===========================
export enum KYCStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export const KYCStatusLabels: Record<KYCStatus, string> = {
  [KYCStatus.PENDING]: 'Pending',
  [KYCStatus.UNDER_REVIEW]: 'Under Review',
  [KYCStatus.VERIFIED]: 'Verified',
  [KYCStatus.REJECTED]: 'Rejected',
  [KYCStatus.EXPIRED]: 'Expired'
};

// ===========================
// CardType
// ===========================
export enum CardType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

// ===========================
// CardStatus
// ===========================
export enum CardStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
  PENDING = 'PENDING'
}

// ===========================
// CardNetwork
// ===========================
export enum CardNetwork {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD'
}

// ===========================
// LoanType
// ===========================
export enum LoanType {
  PERSONAL = 'PERSONAL',
  HOME = 'HOME',
  CAR = 'CAR',
  EDUCATION = 'EDUCATION',
  BUSINESS = 'BUSINESS',
  AGRICULTURE = 'AGRICULTURE',
  GOLD = 'GOLD',
  MORTGAGE = 'MORTGAGE',
  SME = 'SME',
  OVERDRAFT = 'OVERDRAFT'
}

// ===========================
// LoanStatus
// ===========================
export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  OVERDUE = 'OVERDUE',
  DEFAULTED = 'DEFAULTED'
}

// ===========================
// RepaymentStatus
// ===========================
export enum RepaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  LATE = 'LATE',
  MISSED = 'MISSED'
}

// ===========================
// HolderType
// ===========================
export enum HolderType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  OPTIONAL = 'OPTIONAL',
  INTER_BANK_SETTLEMENT = 'INTER_BANK_SETTLEMENT',
  INTER_BRANCH_SETTLEMENT = 'INTER_BRANCH_SETTLEMENT'
}

// ===========================
// EntryType
// ===========================
export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

// ===========================
// BranchType
// ===========================
export enum BranchType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  BRANCH = 'BRANCH',
  AGENT_BANK = 'AGENT_BANK'
}

// ===========================
// BranchStatus
// ===========================
export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}

// ===========================
// BeneficiaryType
// ===========================
export enum BeneficiaryType {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  BANK = 'BANK',
  CARD = 'CARD',
  INTER_BANK = 'INTER_BANK'
}

// ===========================
// ATMTransactionType
// ===========================
export enum ATMTransactionType {
  CASH_WITHDRAW = 'CASH_WITHDRAW',
  CASH_DEPOSIT = 'CASH_DEPOSIT',
  REFILL = 'REFILL'
}

// ===========================
// ATMStatus
// ===========================
export enum ATMStatus {
  ACTIVE = 'ACTIVE',
  OFFLINE = 'OFFLINE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  MAINTENANCE = 'MAINTENANCE'
}

// ===========================
// NomineeRelation
// ===========================
export enum NomineeRelation {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  SISTER = 'SISTER',
  BROTHER = 'BROTHER',
  UNCLE = 'UNCLE',
  AUNTY = 'AUNTY',
  COUSIN = 'COUSIN',
  OTHER = 'OTHER'
}

// ===========================
// OtpStatus
// ===========================
export enum OtpStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

// ===========================
// ChequeLeafStatus
// ===========================
export enum ChequeLeafStatus {
  UNUSED = 'UNUSED',
  ISSUED = 'ISSUED',
  PRESENTED = 'PRESENTED',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
  STOP_PAYMENT = 'STOP_PAYMENT',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

// ===========================
// ChequeBookStatus
// ===========================
export enum ChequeBookStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  PRINTED = 'PRINTED',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  ACTIVE = 'ACTIVE',
  EXHAUSTED = 'EXHAUSTED',
  BLOCKED = 'BLOCKED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

// ===========================
// Designation (with displayName and defaultRole)
// ===========================
export interface DesignationInfo {
  displayName: string;
  defaultRole: Role;
}

export enum Designation {
  CHIEF_EXECUTIVE_OFFICER = 'CHIEF_EXECUTIVE_OFFICER',
  MANAGING_DIRECTOR = 'MANAGING_DIRECTOR',
  DEPUTY_MANAGING_DIRECTOR = 'DEPUTY_MANAGING_DIRECTOR',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  DEPUTY_GENERAL_MANAGER = 'DEPUTY_GENERAL_MANAGER',
  ASSISTANT_GENERAL_MANAGER = 'ASSISTANT_GENERAL_MANAGER',
  BRANCH_MANAGER = 'BRANCH_MANAGER',
  ASSISTANT_BRANCH_MANAGER = 'ASSISTANT_BRANCH_MANAGER',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  TELLER = 'TELLER',
  CASH_OFFICER = 'CASH_OFFICER',
  CUSTOMER_SERVICE_OFFICER = 'CUSTOMER_SERVICE_OFFICER',
  RELATIONSHIP_MANAGER = 'RELATIONSHIP_MANAGER',
  LOAN_OFFICER = 'LOAN_OFFICER',
  ACCOUNTS_OFFICER = 'ACCOUNTS_OFFICER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  AUDIT_OFFICER = 'AUDIT_OFFICER',
  SYSTEM_ADMINISTRATOR = 'SYSTEM_ADMINISTRATOR',
  SOFTWARE_ENGINEER = 'SOFTWARE_ENGINEER',
  NETWORK_ENGINEER = 'NETWORK_ENGINEER',
  DATABASE_ADMINISTRATOR = 'DATABASE_ADMINISTRATOR',
  HR_OFFICER = 'HR_OFFICER',
  ADMIN_OFFICER = 'ADMIN_OFFICER',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  TREASURY_OFFICER = 'TREASURY_OFFICER',
  SECURITY_OFFICER = 'SECURITY_OFFICER',
  OFFICE_ASSISTANT = 'OFFICE_ASSISTANT',
  INTERN = 'INTERN'
}

export const DesignationMap: Record<Designation, DesignationInfo> = {
  [Designation.CHIEF_EXECUTIVE_OFFICER]: { displayName: 'Chief Executive Officer', defaultRole: Role.SUPER_ADMIN },
  [Designation.MANAGING_DIRECTOR]: { displayName: 'Managing Director', defaultRole: Role.SUPER_ADMIN },
  [Designation.DEPUTY_MANAGING_DIRECTOR]: { displayName: 'Deputy Managing Director', defaultRole: Role.ADMIN },
  [Designation.GENERAL_MANAGER]: { displayName: 'General Manager', defaultRole: Role.ADMIN },
  [Designation.DEPUTY_GENERAL_MANAGER]: { displayName: 'Deputy General Manager', defaultRole: Role.ADMIN },
  [Designation.ASSISTANT_GENERAL_MANAGER]: { displayName: 'Assistant General Manager', defaultRole: Role.ADMIN },
  [Designation.BRANCH_MANAGER]: { displayName: 'Branch Manager', defaultRole: Role.BRANCH_MANAGER },
  [Designation.ASSISTANT_BRANCH_MANAGER]: { displayName: 'Assistant Branch Manager', defaultRole: Role.BRANCH_MANAGER },
  [Designation.OPERATIONS_MANAGER]: { displayName: 'Operations Manager', defaultRole: Role.BRANCH_MANAGER },
  [Designation.TELLER]: { displayName: 'Teller', defaultRole: Role.CASHIER },
  [Designation.CASH_OFFICER]: { displayName: 'Cash Officer', defaultRole: Role.CASHIER },
  [Designation.CUSTOMER_SERVICE_OFFICER]: { displayName: 'Customer Service Officer', defaultRole: Role.CUSTOMER_SERVICE },
  [Designation.RELATIONSHIP_MANAGER]: { displayName: 'Relationship Manager', defaultRole: Role.CUSTOMER_SERVICE },
  [Designation.LOAN_OFFICER]: { displayName: 'Loan Officer', defaultRole: Role.LOAN_OFFICER },
  [Designation.ACCOUNTS_OFFICER]: { displayName: 'Accounts Officer', defaultRole: Role.ACCOUNTANT },
  [Designation.COMPLIANCE_OFFICER]: { displayName: 'Compliance Officer', defaultRole: Role.AUDITOR },
  [Designation.AUDIT_OFFICER]: { displayName: 'Audit Officer', defaultRole: Role.AUDITOR },
  [Designation.SYSTEM_ADMINISTRATOR]: { displayName: 'System Administrator', defaultRole: Role.ADMIN },
  [Designation.SOFTWARE_ENGINEER]: { displayName: 'Software Engineer', defaultRole: Role.ADMIN },
  [Designation.NETWORK_ENGINEER]: { displayName: 'Network Engineer', defaultRole: Role.ADMIN },
  [Designation.DATABASE_ADMINISTRATOR]: { displayName: 'Database Administrator', defaultRole: Role.ADMIN },
  [Designation.HR_OFFICER]: { displayName: 'HR Officer', defaultRole: Role.ADMIN },
  [Designation.ADMIN_OFFICER]: { displayName: 'Admin Officer', defaultRole: Role.ADMIN },
  [Designation.FINANCE_OFFICER]: { displayName: 'Finance Officer', defaultRole: Role.ACCOUNTANT },
  [Designation.TREASURY_OFFICER]: { displayName: 'Treasury Officer', defaultRole: Role.ACCOUNTANT },
  [Designation.SECURITY_OFFICER]: { displayName: 'Security Officer', defaultRole: Role.ADMIN },
  [Designation.OFFICE_ASSISTANT]: { displayName: 'Office Assistant', defaultRole: Role.CUSTOMER_SERVICE },
  [Designation.INTERN]: { displayName: 'Intern', defaultRole: Role.CUSTOMER_SERVICE }
};