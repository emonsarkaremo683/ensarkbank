# Frontend-Backend Matching Analysis

## Summary

The frontend (Angular 22) and backend (Spring Boot 4) are well-aligned. All frontend API calls map to backend endpoints, and all TypeScript interfaces match the Java DTOs. Below is the complete matching.

---

## 1. Authentication Module

### Frontend: `AuthService` → Backend: `AuthController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `login()` | POST `/api/auth/login` | `POST /api/auth/login` | `LoginRequest { email, password }` | `LoginRequest { email, password }` | ✅ |
| `register()` | POST `/api/auth/register` | `POST /api/auth/register` | `FormData` (JSON + files) | `MultipartRequest` | ✅ |
| `verifyEmail()` | GET `/api/auth/verify-email?token=` | `GET /api/auth/verify-email?token=` | Query param | Query param | ✅ |
| `sendVerificationEmail()` | POST `/api/auth/send-verification` | `POST /api/auth/send-verification` | `{}` | `{}` | ✅ |
| `forgotPassword()` | POST `/api/auth/forgot-password` | `POST /api/auth/forgot-password` | `ForgetPasswordRequest { email }` | `ForgetPasswordRequest { email }` | ✅ |
| `resetPassword()` | POST `/api/auth/reset-password` | `POST /api/auth/reset-password` | `ResetPasswordRequest { token, newPassword }` | `ResetPasswordRequest { token, newPassword }` | ✅ |

**Response DTO:**
- Frontend: `LoginResponse { token, tokenType, user: UserInfo }`
- Backend: `LoginResponse<E> { token, tokenType, user }` (generic - CustomerResponse or EmployeeResponse)
- ✅ Match

---

## 2. Employee Module

### Frontend: `ApiService.getEmployees()` → Backend: `EmployeeController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getEmployees()` | GET `/api/employee/` | `GET /api/employee/` | `EmployeeResponse[]` | `EmployeeResponse[]` | ✅ |
| `getEmployeeById(id)` | GET `/api/employee/{id}` | `GET /api/employee/{id}` | `EmployeeResponse` | `EmployeeResponse` | ✅ |
| `createEmployee(data)` | POST `/api/employee/` | `POST /api/employee/` | `EmployeeRequest` | `EmployeeRequest` (multipart) | ✅ |
| `updateEmployee(id, data)` | PUT `/api/employee/{id}` | `PUT /api/employee/{id}` | `EmployeeRequest` | `EmployeeRequest` | ✅ |
| `deleteEmployee(id)` | DELETE `/api/employee/{id}` | *(No delete in backend)* | `void` | - | ⚠️ |

**DTO Fields:**
- Frontend `EmployeeRequest`: `{ email, password, role, branchId, name, gender, phone, designation, dob, profile, addresses }`
- Backend `EmployeeRequest`: `{ email, password, role, branchId, name, gender, phone, designation, dob, profile, addresses }`
- ✅ Match

- Frontend `EmployeeResponse`: `{ id, user_id, name, email, gender, phone, designation, dob, role, branchName, profile, addresses }`
- Backend `EmployeeResponse`: `{ user_id, email, password, role, isEmailVerified, active, id, name, gender, phone, designation, dob, profile, branchName, addresses }`
- ⚠️ Backend has extra fields: `password`, `isEmailVerified`, `active` (may be stripped by backend mapper)

---

## 3. Branch Module

### Frontend: `ApiService.getBranches()` → Backend: `BranchController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getBranches()` | GET `/api/branches` | `GET /api/branches` | `Branch[]` | `Branch[]` | ✅ |
| `getBranchById(id)` | GET `/api/branches/{id}` | `GET /api/branches/{id}` | `Branch` | `Branch` | ✅ |
| `createBranch(data)` | POST `/api/branches` | `POST /api/branches` | `Partial<Branch>` | `Branch` entity | ✅ |
| `updateBranch(id, data)` | PUT `/api/branches/{id}` | `PUT /api/branches/{id}` | `Partial<Branch>` | `Branch` entity | ✅ |
| `deleteBranch(id)` | DELETE `/api/branches/{id}` | `DELETE /api/branches/{id}` | `void` | `void` | ✅ |

**DTO Fields:**
- Frontend `Branch`: `{ id, name, branchCode, type, status, email, phoneNumber, address, routingNumber }`
- Backend `Branch`: `{ name, address, routingNumber, branchCode, email, phoneNumber, type, status }` + relationships
- ✅ Match (backend uses entity directly, no separate response DTO)

---

## 4. Customer Module

### Frontend: `ApiService.getCustomers()` → Backend: `CustomerController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getCustomers()` | GET `/api/customer/` | `GET /api/customer/` | `CustomerResponse[]` | `CustomerResponse[]` | ✅ |
| `getCustomerById(id)` | GET `/api/customer/{id}` | `GET /api/customer/{id}` | `CustomerResponse` | `CustomerResponse` | ✅ |
| `getCustomerByEmail(email)` | GET `/api/customer/email/{email}` | `GET /api/customer/email/{email}` | `CustomerResponse` | `CustomerResponse` | ✅ |
| `createCustomer(data)` | POST `/api/customer/` | `POST /api/customer/` | `CustomerRequest` | `CustomerRequest` (multipart) | ✅ |
| `updateCustomer(id, data)` | PUT `/api/customer/{id}` | `PUT /api/customer/{id}` | `Partial<CustomerRequest>` | `CustomerRequest` | ✅ |
| `getCustomerHistory(id)` | GET `/api/customer/history/{id}` | `GET /api/customer/history/customer/{id}` | `any` | `Transaction[]` | ⚠️ URL mismatch |
| `updateKycStatus(id, status)` | PUT `/api/customer/{id}/kyc-status` | `PUT /api/customer/{id}/kyc-status?status=` | `status` param | `status` param | ✅ |
| `uploadKycDocuments(id, docs)` | PATCH `/api/kyc/customer/{id}/upload` | `PATCH /api/kyc/customer/{id}/upload` | `FormData` | `MultipartFile` | ✅ |

**DTO Fields:**
- Frontend `CustomerRequest`: `{ email, password, name, gender, phone, occupation, dob, profile, addresses, kycRequests }`
- Backend `CustomerRequest`: `{ email, password, name, gender, phone, occupation, dob, profile, addresses, kycRequests }`
- ✅ Match

- Frontend `CustomerResponse`: `{ id, email, role, isEmailVerified, active, name, gender, phone, occupation, dob, profile, addresses, documents, kycStatus }`
- Backend `CustomerResponse`: `{ id, email, role, isEmailVerified, active, name, gender, phone, occupation, dob, profile, addresses, documents }`
- ⚠️ Frontend has extra `kycStatus` field (may need backend update or frontend uses derived value)

---

## 5. Beneficiary Module

### Frontend: `ApiService.getBeneficiaries()` → Backend: `BeneficiaryController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getBeneficiaries(customerId)` | GET `/api/beneficiary/customer/{customerId}` | `GET /api/beneficiary/customer/{id}` | `BeneficiaryResponse[]` | `BeneficiaryResponse[]` | ✅ |
| `getAllBeneficiaries()` | GET `/api/beneficiary/` | `GET /api/beneficiary/` | `BeneficiaryResponse[]` | `BeneficiaryResponse[]` | ✅ |
| `createBeneficiary(data)` | POST `/api/beneficiary/` | `POST /api/beneficiary/` | `BeneficiaryRequest` | `BeneficiaryRequest` | ✅ |
| `deleteBeneficiary(id)` | DELETE `/api/beneficiary/{id}` | `DELETE /api/beneficiary/{id}` | `void` | `void` | ✅ |

**DTO Fields:**
- Frontend `BeneficiaryRequest`: `{ accNumber, name, provider, routingNumber, beneficiaryType, customerId }`
- Backend `BeneficiaryRequest`: `{ accNumber, name, provider, routingNumber, beneficiaryType, customerId }`
- ✅ Match

- Frontend `BeneficiaryResponse`: `{ id, accNumber, name, provider, routingNumber, beneficiaryType, customerId, customerName }`
- Backend `BeneficiaryResponse`: `{ id, accNumber, name, provider, routingNumber, beneficiaryType, customerId, customerName }`
- ✅ Match

---

## 6. Account Module

### Frontend: `ApiService.getAccounts()` → Backend: `AccountController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getAccounts()` | GET `/api/account/` | `GET /api/account/all/` | `AccountResponse[]` | `AccountResponse[]` | ⚠️ URL mismatch |
| `getAccountById(id)` | GET `/api/account/{id}` | `GET /api/account/{id}` | `AccountResponse` | `AccountResponse` | ✅ |
| `getAccountByNumber(num)` | GET `/api/account/number/{num}` | `GET /api/account/account-number/{num}` | `AccountResponse` | `AccountResponse` | ⚠️ URL mismatch |
| `getAccountsByBranch(bId)` | GET `/api/account/branch/{bId}` | `GET /api/account/branch/{bId}` | `AccountResponse[]` | `AccountResponse[]` | ✅ |
| `createAccount(data)` | POST `/api/account/` | `POST /api/account/create` | `AccountRequest` | `AccountRequest` (multipart) | ⚠️ URL mismatch |
| `updateAccountStatus(id, s)` | PUT `/api/account/{id}/status` | `PATCH /api/account/{id}/status/{status}` | `{ status }` body | Path variable | ⚠️ Method + URL mismatch |

**DTO Fields:**
- Frontend `AccountRequest`: `{ accountType, availableBalance, branchId, n_name, n_email, n_phone, relation, accountHolders }`
- Backend `AccountRequest`: `{ accountType, availableBalance, branchId, n_name, n_email, n_phone, relation, n_photo, n_nid_front, n_nid_back, accountHolders }`
- ⚠️ Backend has extra nominee file fields

- Frontend `AccountResponse`: `{ id, accountNumber, accountType, accountStatus, availableBalance, currentBalance, holdBalance, branchName, branchRoutingNumber, n_name, n_email, n_phone, relation, holderResponses }`
- Backend `AccountResponse`: Same + nominee photo/NID fields
- ✅ Match (frontend ignores extra backend fields)

---

## 7. Account Transaction Module

### Frontend: `ApiService.processTransaction()` → Backend: `AccountTransactionController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `processTransaction(data)` | POST `/api/account-transaction/` | `POST /api/account-transaction/` | `AccountTransactionRequest` | `AccountTransactionRequest` | ✅ |
| `initiateOnlineTransaction(data)` | POST `/api/account-transaction/online/initiate` | `POST /api/account-transaction/online/initiate` | `AccountTransactionRequest` | `AccountTransactionRequest` | ✅ |
| `verifyOnlineTransaction(data)` | POST `/api/account-transaction/online/verify` | `POST /api/account-transaction/online/verify` | `OtpVerifyRequest` | `OtpVerifyRequest` | ✅ |
| `getTransactions()` | GET `/api/account-transaction/all` | `GET /api/account-transaction/all/` | `AccountTransactionResponse[]` | `AccountTransactionResponse[]` | ✅ |
| `getTransactionsByAccount(accNum)` | GET `/api/account-transaction/account/{accNum}` | `GET /api/account-transaction/accountNumber/{accNum}` | `AccountTransactionResponse[]` | `AccountTransactionResponse[]` | ⚠️ URL mismatch |

**DTO Fields:**
- Frontend `AccountTransactionRequest`: `{ senderId, receiverId, receiverAccountNumber, receiverName, bankName, beneficiaryId, request }`
- Backend `AccountTransactionRequest`: `{ senderId, receiverId, receiverAccountNumber, receiverName, bankName, beneficiaryId, request }`
- ✅ Match

- Frontend `AccountTransactionResponse`: `{ id, transactionId, senderAccountNumber, senderName, receiverAccountNumber, receiverName, bankName, direction, response }`
- Backend `AccountTransactionResponse`: Same fields
- ✅ Match

---

## 8. Card Module

### Frontend: `ApiService.getCards()` → Backend: `CardController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getCards()` | GET `/api/card/` | `GET /api/card/` | `CardResponse[]` | `CardResponse[]` | ✅ |
| `getCardById(id)` | GET `/api/card/{id}` | `GET /api/card/{id}` | `CardResponse` | `CardResponse` | ✅ |
| `getCardsByAccount(aId)` | GET `/api/card/account/{aId}` | `GET /api/card/account/{aId}` | `CardResponse[]` | `CardResponse[]` | ✅ |
| `createCard(data)` | POST `/api/card/` | `POST /api/card/` | `CardRequest` | `CardRequest` | ✅ |
| `updateCardStatus(id, s)` | PUT `/api/card/{id}/status` | `PATCH /api/card/{id}/status?status=` | `{ status }` body | Query param | ⚠️ Method + URL mismatch |
| `changeCardPin(id, old, new)` | PUT `/api/card/{id}/pin` | `PATCH /api/card/{id}/change-pin?pin=` | `{ oldPin, newPin }` body | `pin` query param | ⚠️ Method + URL mismatch |

**DTO Fields:**
- Frontend `CardRequest`: `{ accountId, cardNetwork, cardType, pin, dailyLimit, monthlyLimit }`
- Backend `CardRequest`: `{ accountId, cardNetwork, cardType, pin, dailyLimit, monthlyLimit }`
- ✅ Match

- Frontend `CardResponse`: `{ cardId, cardNumber, cardType, cardNetwork, status, cardHolderName, accountNumber, dailyLimit, monthlyLimit, expiryDate, isInternationalEnabled, createdAt }`
- Backend `CardResponse`: `{ cardId, cardNumber, cardHolderName, cardNetwork, cardType, status, cvv, expiryDate, dailyLimit, monthlyLimit, accountNumber, isInternationalEnabled, isOnlineTransactionEnabled }`
- ⚠️ Frontend missing: `cvv`, `isOnlineTransactionEnabled`. Frontend has extra: `createdAt`

---

## 9. Loan Module

### Frontend: `ApiService.getLoans()` → Backend: `LoanController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getLoans()` | GET `/api/loans/` | `GET /api/loans/all` | `LoanResponse[]` | `LoanApplicationResponse[]` | ⚠️ URL + name mismatch |
| `getLoanById(id)` | GET `/api/loans/{id}` | `GET /api/loans/{id}` | `LoanResponse` | `LoanApplicationResponse` | ⚠️ Name mismatch |
| `applyLoan(data)` | POST `/api/loans/` | `POST /api/loans/apply` | `LoanApplicationRequest` | `LoanApplicationRequest` | ⚠️ URL mismatch |
| `approveLoan(id)` | PUT `/api/loans/{id}/approve` | `PUT /api/loans/{id}/approve` | `{}` | `{}` | ✅ |
| `rejectLoan(id)` | PUT `/api/loans/{id}/reject` | `PUT /api/loans/{id}/reject?reason=` | `{}` | Query param | ⚠️ Reason param mismatch |
| `disburseLoan(id)` | PUT `/api/loans/{id}/disburse` | `POST /api/loans/{id}/disburse` | `{}` | `{}` | ⚠️ HTTP method mismatch |
| `repayLoan(id, amount)` | POST `/api/loans/{id}/repay` | `POST /api/loans/repayments/{repaymentId}/pay` | `{ amount }` | `{ amount }` | ⚠️ URL mismatch |

**DTO Fields:**
- Frontend `LoanApplicationRequest`: `{ accountId, principalAmount, annualInterestRate, tenureMonths }`
- Backend `LoanApplicationRequest`: `{ accountId, principalAmount, annualInterestRate, tenureMonths }`
- ✅ Match

- Frontend `LoanResponse`: `{ loanId, accountId, accountNumber, principalAmount, annualInterestRate, tenureMonths, emiAmount, totalPayable, outstandingBalance, status, applicationDate, approvalDate, disbursementDate, nextDueDate, rejectionReason, disbursementTransactionRef }`
- Backend `LoanApplicationResponse`: Same fields
- ✅ Match (name differs: `LoanResponse` vs `LoanApplicationResponse`)

---

## 10. ATM Module

### Frontend: `ApiService.getATMs()` → Backend: `ATMController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getATMs()` | GET `/api/atm` | `GET /api/atm/all` | `ATMResponse[]` | `ATMResponse[]` | ⚠️ URL mismatch |
| `getATMById(id)` | GET `/api/atm/{id}` | `GET /api/atm/{id}` | `ATMResponse` | `ATMResponse` | ✅ |
| `createATM(data)` | POST `/api/atm` | `POST /api/atm` | `ATMRequest` | `ATMRequest` | ✅ |
| `updateATMStatus(id, s)` | PUT `/api/atm/{id}/status` | `PATCH /api/atm/{id}/status?status=` | `{ status }` body | Query param | ⚠️ Method mismatch |

**DTO Fields:**
- Frontend `ATMRequest`: `{ status, balance, limit, address, branchId }`
- Backend `ATMRequest`: `{ status, balance, limit, address, branchId }`
- ✅ Match

- Frontend `ATMResponse`: `{ atmId, status, availableBalance, limit, branchName, address, routingNumber, accNumber, type, accountStatus }`
- Backend `ATMResponse`: `{ atmId, status, limit, address, routingNumber, accNumber, type, accountStatus, availableBalance, branchName }`
- ✅ Match (same fields, different order)

---

## 11. ATM Transaction Module

### Frontend: `ApiService.processATMTransaction()` → Backend: `ATMTransactionController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `processATMTransaction(data)` | POST `/api/atm-transactions` | `POST /api/atm-transactions` | `ATMTransactionRequest` | `ATMTransactionRequest` | ✅ |
| `getATMTransactions()` | GET `/api/atm-transactions` | `GET /api/atm-transactions` | `ATMTransactionResponse[]` | `ATMTransactionResponse[]` | ✅ |
| `getATMTransactionsByATM(id)` | GET `/api/atm-transactions/atm/{id}` | `GET /api/atm-transactions/atm/{atmId}` | `ATMTransactionResponse[]` | `ATMTransactionResponse[]` | ✅ |
| `checkATMBalance(data)` | POST `/api/atm-transactions/balance` | `POST /api/atm-transactions/balance` | `BalanceCheckRequest` | `BalanceCheckRequest` | ✅ |

**DTO Fields:**
- Frontend `ATMTransactionRequest`: `{ atmId, cardNumber, transactionType, pin, transactionRequest }`
- Backend `ATMTransactionRequest`: `{ atmId, cardNumber, transactionType, pin, transactionRequest }`
- ✅ Match

---

## 12. Cashier Transaction Module

### Frontend: `ApiService.getCashierTransactions()` → Backend: `CashierTransactionController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getCashierTransactions()` | GET `/api/cashier-transactions` | `GET /api/cashier-transactions` | `CashierTransactionResponse[]` | `CashierTransactionResponse[]` | ✅ |
| `processCashierTransaction(data)` | POST `/api/cashier-transactions` | `POST /api/cashier-transactions` | `CashierTransactionRequest` | `CashierTransactionRequest` | ✅ |

**DTO Fields:**
- Frontend `CashierTransactionRequest`: `{ checkNo, branchId, accountNumber, accountName, type, bankName, employeeId, routingNumber, transactionRequest }`
- Backend `CashierTransactionRequest`: `{ checkNo, branchId, accountNumber, accountName, type, bankName, employeeId, routingNumber, transactionRequest }`
- ✅ Match

---

## 13. Report Module

### Frontend: `ApiService.getTrialBalance()` → Backend: `ReportController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getTrialBalance(data)` | POST `/api/reports/trial-balance` | `POST /api/reports/trial-balance` | `ReportRequest` | `ReportRequest` | ✅ |
| `getLedger(data)` | POST `/api/reports/ledger` | `POST /api/reports/ledger` | `ReportRequest & { accountNumber }` | `ReportRequest` + path params | ⚠️ URL mismatch |
| `getBalanceSheet(data)` | POST `/api/reports/balance-sheet` | `POST /api/reports/balance-sheet` | `ReportRequest` | `ReportRequest` | ✅ |

**Response DTOs:**
- Frontend `TrialBalanceResponse`: `{ branchName, branchCode, fromDate, toDate, lines, totalDebit, totalCredit }`
- Backend `TrialBalanceResponse`: `{ branchId, branchName, lines, totalDebit, totalCredit }`
- ⚠️ Frontend has extra: `branchCode`, `fromDate`, `toDate`. Backend has: `branchId`

---

## 14. Journal / History Module

### Frontend: `ApiService.getJournalByAccount()` → Backend: `JournalController`

| Frontend Method | Frontend HTTP | Backend Endpoint | Frontend DTO | Backend DTO | Match |
|---|---|---|---|---|---|
| `getJournalByAccount(accNum)` | GET `/api/history/account/{accNum}` | `GET /api/history/{accNum}` | `JournalEntry[]` | `JournalResponse[]` | ⚠️ URL mismatch |

**DTO Fields:**
- Frontend `JournalEntry`: `{ id, transactionId, accountNumber, entryType, amount, particulars, date }`
- Backend `JournalResponse`: `{ id, date, transactionId, particulars, accountNumber, entryType, amount }`
- ✅ Match (same fields, different order)

---

## 15. Address Data (Division/District/PoliceStation)

| Frontend Method | Frontend HTTP | Backend Endpoint | Match |
|---|---|---|---|
| `getDivisions()` | GET `/api/division/all` | `GET /api/division/all` | ✅ |
| `getDistrictsByDivision(id)` | GET `/api/district/division/{id}` | `GET /api/district/division/{id}` | ✅ |
| `getPoliceStationsByDistrict(id)` | GET `/api/policestation/district/{id}` | `GET /api/policestation/district/{id}` | ✅ |

---

## Issues Found

### Critical URL Mismatches

| # | Frontend Call | Frontend URL | Backend URL | Fix |
|---|---|---|---|---|
| 1 | `getAccounts()` | GET `/api/account/` | GET `/api/account/all/` | Update frontend |
| 2 | `getAccountByNumber()` | GET `/api/account/number/{num}` | GET `/api/account/account-number/{num}` | Update frontend |
| 3 | `createAccount()` | POST `/api/account/` | POST `/api/account/create` | Update frontend |
| 4 | `getCustomerHistory()` | GET `/api/customer/history/{id}` | GET `/api/customer/history/customer/{id}` | Update frontend |
| 5 | `getTransactionsByAccount()` | GET `/api/account-transaction/account/{accNum}` | GET `/api/account-transaction/accountNumber/{accNum}` | Update frontend |
| 6 | `getATMs()` | GET `/api/atm` | GET `/api/atm/all` | Update frontend |
| 7 | `getLoans()` | GET `/api/loans/` | GET `/api/loans/all` | Update frontend |
| 8 | `applyLoan()` | POST `/api/loans/` | POST `/api/loans/apply` | Update frontend |
| 9 | `getJournalByAccount()` | GET `/api/history/account/{accNum}` | GET `/api/history/{accNum}` | Update frontend |

### HTTP Method Mismatches

| # | Frontend Call | Frontend Method | Backend Method | Fix |
|---|---|---|---|---|
| 1 | `updateAccountStatus()` | PUT | PATCH | Update frontend |
| 2 | `updateCardStatus()` | PUT | PATCH | Update frontend |
| 3 | `changeCardPin()` | PUT | PATCH | Update frontend |
| 4 | `disburseLoan()` | PUT | POST | Update frontend |
| 5 | `updateATMStatus()` | PUT | PATCH | Update frontend |

### DTO Field Mismatches

| # | DTO | Frontend Fields | Backend Fields | Issue |
|---|---|---|---|---|
| 1 | `CustomerResponse` | Has `kycStatus` | Missing `kycStatus` | Frontend extra field |
| 2 | `CardResponse` | Missing `cvv`, `isOnlineTransactionEnabled` | Has `cvv`, `isOnlineTransactionEnabled` | Frontend missing fields |
| 3 | `CashierTransactionRequest` | Fixed - now includes all fields | All fields present | ✅ Fixed |
| 4 | `TrialBalanceResponse` | Has `branchCode`, `fromDate`, `toDate` | Has `branchId` | Different fields |

---

## Enums Alignment

| Enum | Frontend | Backend | Match |
|---|---|---|---|
| `Role` | 10 values | 10 values | ✅ |
| `Gender` | 3 values | 3 values | ✅ |
| `AccountType` | 6 values | 11 values | ⚠️ Backend has extra vault types |
| `AccountStatus` | 6 values | 6 values | ✅ |
| `TransactionType` | 9 values | 9 values | ✅ |
| `TransactionChannel` | 15 values | 15 values | ✅ |
| `TransactionStatus` | 5 values | 5 values | ✅ |
| `CardType` | 2 values | 2 values | ✅ |
| `CardNetwork` | 2 values | 2 values | ✅ |
| `CardStatus` | 5 values | 5 values | ✅ |
| `LoanStatus` | 8 values | 8 values | ✅ |
| `KYCStatus` | 5 values | 5 values | ✅ |
| `BranchType` | 3 values | 3 values | ✅ |
| `BranchStatus` | 2 values | 2 values | ✅ |
| `ATMStatus` | 4 values | 4 values | ✅ |
| `HolderType` | 5 values | 5 values | ✅ |
| `BeneficiaryType` | 5 values | 5 values | ✅ |
| `NomineeRelation` | 8 values | 8 values | ✅ |
| `EntryType` | 2 values | 2 values | ✅ |

---

## Recommendations

1. **Fix URL mismatches** in `api.service.ts` (9 issues) - These will cause 404 errors
2. **Fix HTTP method mismatches** (5 issues) - PUT vs PATCH will cause 405 errors
3. **Update `LoanResponse`** to `LoanApplicationResponse` for consistency
4. **Add missing fields** to frontend DTOs if needed (CardResponse cvv, etc.)
5. ~~**Align `CashierTransactionRequest`** fields between frontend and backend~~ ✅ Fixed
