import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Branch, CustomerRequest, CustomerResponse, EmployeeRequest, EmployeeResponse,
  AccountRequest, AccountResponse, AccountTransactionRequest, AccountTransactionResponse,
  OtpInitiateResponse, OtpVerifyRequest, BeneficiaryRequest, BeneficiaryResponse,
  LoanApplicationRequest, LoanResponse, LoanRepayment, CardRequest, CardResponse,
  CardSettingsRequest,
  ATMRequest, ATMResponse, ATMTransactionRequest, ATMTransactionResponse,
  BalanceCheckRequest, CashierTransactionRequest, CashierTransactionResponse,
  ReportRequest, TrialBalanceResponse, LedgerResponse, BalanceSheetResponse,
  Transaction, JournalEntry, Division, District, PoliceStation,
  DashboardStats
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private normalizeDivisions(data: any): Division[] {
    if (Array.isArray(data)) {
      return data.map(item => this.normalizeDivision(item));
    }
    if (data && Array.isArray(data.content)) {
      return data.content.map((item: any) => this.normalizeDivision(item));
    }
    if (data && Array.isArray(data.data)) {
      return data.data.map((item: any) => this.normalizeDivision(item));
    }
    if (data && Array.isArray(data.result)) {
      return data.result.map((item: any) => this.normalizeDivision(item));
    }
    return [];
  }

  private normalizeDivision(item: any): Division {
    return {
      id: Number(item?.id ?? item?.divisionId ?? item?.division?.id ?? 0),
      name: item?.name ?? item?.divisionName ?? item?.label ?? item?.title ?? ''
    };
  }

  private normalizeDistricts(data: any): District[] {
    if (Array.isArray(data)) {
      return data.map(item => this.normalizeDistrict(item));
    }
    if (data && Array.isArray(data.content)) {
      return data.content.map((item: any) => this.normalizeDistrict(item));
    }
    if (data && Array.isArray(data.data)) {
      return data.data.map((item: any) => this.normalizeDistrict(item));
    }
    if (data && Array.isArray(data.result)) {
      return data.result.map((item: any) => this.normalizeDistrict(item));
    }
    return [];
  }

  private normalizeDistrict(item: any): District {
    return {
      id: Number(item?.id ?? item?.districtId ?? item?.district?.id ?? 0),
      name: item?.name ?? item?.districtName ?? item?.label ?? item?.title ?? '',
      divisionId: Number(item?.divisionId ?? item?.division?.id ?? item?.division_id ?? 0)
    };
  }

  private normalizePoliceStations(data: any): PoliceStation[] {
    if (Array.isArray(data)) {
      return data.map(item => this.normalizePoliceStation(item));
    }
    if (data && Array.isArray(data.content)) {
      return data.content.map((item: any) => this.normalizePoliceStation(item));
    }
    if (data && Array.isArray(data.data)) {
      return data.data.map((item: any) => this.normalizePoliceStation(item));
    }
    if (data && Array.isArray(data.result)) {
      return data.result.map((item: any) => this.normalizePoliceStation(item));
    }
    return [];
  }

  private normalizePoliceStation(item: any): PoliceStation {
    return {
      id: Number(item?.id ?? item?.policeStationId ?? item?.policeStation?.id ?? 0),
      name: item?.name ?? item?.policeStationName ?? item?.label ?? item?.title ?? '',
      districtId: Number(item?.districtId ?? item?.district?.id ?? item?.district_id ?? 0)
    };
  }


  // Employee
  getEmployees(): Observable<EmployeeResponse[]> { return this.http.get<EmployeeResponse[]>(`${this.BASE}/employee/`); }
  getEmployeesByBranchId(branchId: number): Observable<EmployeeResponse[]> { return this.http.get<EmployeeResponse[]>(`${this.BASE}/employee/branch/${branchId}`); }
  getEmployeeById(id: number): Observable<EmployeeResponse> { return this.http.get<EmployeeResponse>(`${this.BASE}/employee/${id}`); }
  createEmployee(formData: FormData): Observable<EmployeeResponse> { return this.http.post<EmployeeResponse>(`${this.BASE}/employee/`, formData); }
  updateEmployee(id: number, formData: FormData): Observable<EmployeeResponse> { return this.http.put<EmployeeResponse>(`${this.BASE}/employee/${id}`, formData); }
  updateEmployeeProfilePicture(id: number, formData: FormData): Observable<EmployeeResponse> { return this.http.patch<EmployeeResponse>(`${this.BASE}/employee/${id}/updateProfilePicture`, formData); }
  deleteEmployee(id: number): Observable<void> { return this.http.delete<void>(`${this.BASE}/employee/${id}`); }

  // Branch
  getBranches(): Observable<Branch[]> { return this.http.get<Branch[]>(`${this.BASE}/branches`); }
  getBranchById(id: number): Observable<Branch> { return this.http.get<Branch>(`${this.BASE}/branches/${id}`); }
  createBranch(data: Partial<Branch>): Observable<Branch> { return this.http.post<Branch>(`${this.BASE}/branches`, data); }
  updateBranch(id: number, data: Partial<Branch>): Observable<Branch> { return this.http.put<Branch>(`${this.BASE}/branches/${id}`, data); }
  deleteBranch(id: number): Observable<void> { return this.http.delete<void>(`${this.BASE}/branches/${id}`); }

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> { return this.http.get<DashboardStats>(`${this.BASE}/dashboard/stats`); }

  // Customer
  getCustomers(): Observable<CustomerResponse[]> { return this.http.get<CustomerResponse[]>(`${this.BASE}/customer/`); }
  getCustomerById(id: number): Observable<CustomerResponse> { return this.http.get<CustomerResponse>(`${this.BASE}/customer/${id}`); }
  getCustomerByEmail(email: string): Observable<CustomerResponse> { return this.http.get<CustomerResponse>(`${this.BASE}/customer/email/${email}`); }
  createCustomer(formData: FormData): Observable<CustomerResponse> { return this.http.post<CustomerResponse>(`${this.BASE}/customer/`, formData); }
  updateCustomer(id: number, formData: FormData): Observable<CustomerResponse> { return this.http.put<CustomerResponse>(`${this.BASE}/customer/${id}`, formData); }
  getCustomerHistory(id: number): Observable<any> { return this.http.get(`${this.BASE}/customer/history/customer/${id}`); }
  updateKycStatus(id: number, status: string): Observable<CustomerResponse> { return this.http.put<CustomerResponse>(`${this.BASE}/customer/${id}/kyc-status`, null, { params: { status } }); }
  uploadKycDocuments(customerId: number, documents: FormData): Observable<CustomerResponse> { return this.http.patch<CustomerResponse>(`${this.BASE}/kyc/customer/${customerId}/upload`, documents); }
  getKycDocumentUrl(documentId: number): string { return `${this.BASE}/kyc/documents/${documentId}`; }
  getKycDocumentBlob(documentId: number): Observable<Blob> { return this.http.get(`${this.BASE}/kyc/documents/${documentId}`, { responseType: 'blob' }); }

  // Beneficiary
  getBeneficiaries(customerId: number): Observable<BeneficiaryResponse[]> { return this.http.get<BeneficiaryResponse[]>(`${this.BASE}/beneficiary/customer/${customerId}`); }
  getAllBeneficiaries(): Observable<BeneficiaryResponse[]> { return this.http.get<BeneficiaryResponse[]>(`${this.BASE}/beneficiary/`); }
  createBeneficiary(data: BeneficiaryRequest): Observable<BeneficiaryResponse> { return this.http.post<BeneficiaryResponse>(`${this.BASE}/beneficiary/`, data); }
  deleteBeneficiary(id: number): Observable<void> { return this.http.delete<void>(`${this.BASE}/beneficiary/${id}`); }

  // Account
  getAccounts(): Observable<AccountResponse[]> { return this.http.get<AccountResponse[]>(`${this.BASE}/account/all/`); }
  getAccountById(id: number): Observable<AccountResponse> { return this.http.get<AccountResponse>(`${this.BASE}/account/${id}`); }
  getAccountByNumber(number: string): Observable<AccountResponse> { return this.http.get<AccountResponse>(`${this.BASE}/account/account-number/${number}`); }
  getAccountsByBranch(branchId: number): Observable<AccountResponse[]> { return this.http.get<AccountResponse[]>(`${this.BASE}/account/branch/${branchId}`); }
  getAccountsByBranchAndChildren(branchId: number): Observable<AccountResponse[]> { return this.http.get<AccountResponse[]>(`${this.BASE}/account/branch/${branchId}/all`); }
  getAccountsByCustomerId(customerId: number): Observable<AccountResponse[]> { return this.http.get<AccountResponse[]>(`${this.BASE}/account/customer/${customerId}`); }
  createAccount(data: AccountRequest | FormData): Observable<AccountResponse> { return this.http.post<AccountResponse>(`${this.BASE}/account/create`, data); }
  updateAccountStatus(id: number, status: string): Observable<AccountResponse> { return this.http.patch<AccountResponse>(`${this.BASE}/account/${id}/status/${status}`, null); }

  // Transactions
  processTransaction(data: AccountTransactionRequest): Observable<AccountTransactionResponse> { return this.http.post<AccountTransactionResponse>(`${this.BASE}/account-transaction/`, data); }
  initiateOnlineTransaction(data: AccountTransactionRequest): Observable<OtpInitiateResponse> { return this.http.post<OtpInitiateResponse>(`${this.BASE}/account-transaction/online/initiate`, data); }
  verifyOnlineTransaction(data: OtpVerifyRequest): Observable<AccountTransactionResponse> { return this.http.post<AccountTransactionResponse>(`${this.BASE}/account-transaction/online/verify`, data); }
  getTransactions(): Observable<AccountTransactionResponse[]> { return this.http.get<AccountTransactionResponse[]>(`${this.BASE}/account-transaction/all`); }
  getTransactionsByAccount(accountNumber: string): Observable<AccountTransactionResponse[]> { return this.http.get<AccountTransactionResponse[]>(`${this.BASE}/account-transaction/accountNumber/${accountNumber}`); }
  getTransactionsByAccountId(accountId: number): Observable<AccountTransactionResponse[]> { return this.http.get<AccountTransactionResponse[]>(`${this.BASE}/account-transaction/account/${accountId}`); }

  // Loans
  getLoans(): Observable<LoanResponse[]> { return this.http.get<LoanResponse[]>(`${this.BASE}/loans/all`); }
  getLoansByAccount(accountId: number): Observable<LoanResponse[]> { return this.http.get<LoanResponse[]>(`${this.BASE}/loans/account/${accountId}`); }
  getLoanById(id: number): Observable<LoanResponse> { return this.http.get<LoanResponse>(`${this.BASE}/loans/${id}`); }
  applyLoan(data: LoanApplicationRequest): Observable<LoanResponse> { return this.http.post<LoanResponse>(`${this.BASE}/loans/apply`, data); }
  approveLoan(id: number): Observable<LoanResponse> { return this.http.put<LoanResponse>(`${this.BASE}/loans/${id}/approve`, {}); }
  rejectLoan(id: number, reason?: string): Observable<LoanResponse> { return this.http.put<LoanResponse>(`${this.BASE}/loans/${id}/reject`, null, { params: reason ? { reason } : {} }); }
  disburseLoan(id: number): Observable<LoanResponse> { return this.http.post<LoanResponse>(`${this.BASE}/loans/${id}/disburse`, {}); }
  getLoanRepayments(loanId: number): Observable<LoanRepayment[]> { return this.http.get<LoanRepayment[]>(`${this.BASE}/loans/${loanId}/repayments`); }
  payInstallment(repaymentId: number): Observable<LoanRepayment> { return this.http.post<LoanRepayment>(`${this.BASE}/loans/repayments/${repaymentId}/pay`, {}); }

  // Cards
  getCards(): Observable<CardResponse[]> { return this.http.get<CardResponse[]>(`${this.BASE}/card/`); }
  getCardById(id: number): Observable<CardResponse> { return this.http.get<CardResponse>(`${this.BASE}/card/${id}`); }
  getCardsByAccount(accountId: number): Observable<CardResponse[]> { return this.http.get<CardResponse[]>(`${this.BASE}/card/account/${accountId}`); }
  createCard(data: CardRequest): Observable<CardResponse> { return this.http.post<CardResponse>(`${this.BASE}/card/`, data); }
  updateCardStatus(id: number, status: string, dailyLimit?: number, monthlyLimit?: number): Observable<CardResponse> {
    let params = new HttpParams().set('status', status);
    if (dailyLimit !== undefined) params = params.set('dailyLimit', dailyLimit.toString());
    if (monthlyLimit !== undefined) params = params.set('monthlyLimit', monthlyLimit.toString());
    return this.http.patch<CardResponse>(`${this.BASE}/card/${id}/status`, null, { params });
  }
  changeCardPin(id: number, oldPin: string, newPin: string): Observable<any> { return this.http.patch(`${this.BASE}/card/${id}/change-pin`, null, { params: { pin: newPin } }); }

  // Card Settings Requests
  createCardSettingsRequest(cardId: number, requestType: string, requestedValue: boolean): Observable<CardSettingsRequest> {
    return this.http.post<CardSettingsRequest>(`${this.BASE}/card-settings-requests/`, { cardId, requestType, requestedValue });
  }
  getCardSettingsRequestsByCustomer(customerId: number): Observable<CardSettingsRequest[]> {
    return this.http.get<CardSettingsRequest[]>(`${this.BASE}/card-settings-requests/customer/${customerId}`);
  }
  getPendingCardSettingsRequests(): Observable<CardSettingsRequest[]> {
    return this.http.get<CardSettingsRequest[]>(`${this.BASE}/card-settings-requests/pending`);
  }
  getCardSettingsRequestsByCard(cardId: number): Observable<CardSettingsRequest[]> {
    return this.http.get<CardSettingsRequest[]>(`${this.BASE}/card-settings-requests/card/${cardId}`);
  }
  approveCardSettingsRequest(id: number): Observable<CardSettingsRequest> {
    return this.http.put<CardSettingsRequest>(`${this.BASE}/card-settings-requests/${id}/approve`, {});
  }
  rejectCardSettingsRequest(id: number, reason: string): Observable<CardSettingsRequest> {
    return this.http.put<CardSettingsRequest>(`${this.BASE}/card-settings-requests/${id}/reject`, { reason });
  }

  // ATM
  getATMs(): Observable<ATMResponse[]> { return this.http.get<ATMResponse[]>(`${this.BASE}/atm/all`); }
  getATMById(id: number): Observable<ATMResponse> { return this.http.get<ATMResponse>(`${this.BASE}/atm/${id}`); }
  createATM(data: ATMRequest): Observable<ATMResponse> { return this.http.post<ATMResponse>(`${this.BASE}/atm`, data); }
  updateATM(id: number, data: ATMRequest): Observable<ATMResponse> { return this.http.put<ATMResponse>(`${this.BASE}/atm/update/${id}`, data); }
  updateATMStatus(id: number, status: string): Observable<ATMResponse> { return this.http.patch<ATMResponse>(`${this.BASE}/atm/${id}/status`, null, { params: { status } }); }

  // ATM Transactions
  processATMTransaction(data: ATMTransactionRequest): Observable<ATMTransactionResponse> { return this.http.post<ATMTransactionResponse>(`${this.BASE}/atm-transactions`, data); }
  getATMTransactions(): Observable<ATMTransactionResponse[]> { return this.http.get<ATMTransactionResponse[]>(`${this.BASE}/atm-transactions`); }
  getATMTransactionsByATM(atmId: number): Observable<ATMTransactionResponse[]> { return this.http.get<ATMTransactionResponse[]>(`${this.BASE}/atm-transactions/atm/${atmId}`); }
  checkATMBalance(data: BalanceCheckRequest): Observable<any> { return this.http.post(`${this.BASE}/atm-transactions/balance`, data); }

  // Cashier Transactions
  getCashierTransactions(): Observable<CashierTransactionResponse[]> { return this.http.get<CashierTransactionResponse[]>(`${this.BASE}/cashier-transactions`); }
  getCashierTransactionsByAccount(accountNumber: string): Observable<CashierTransactionResponse[]> { return this.http.get<CashierTransactionResponse[]>(`${this.BASE}/cashier-transactions/account/${accountNumber}`); }
  processCashierTransaction(data: CashierTransactionRequest): Observable<CashierTransactionResponse> { return this.http.post<CashierTransactionResponse>(`${this.BASE}/cashier-transactions`, data); }

  // Reports
  getTrialBalance(data: ReportRequest): Observable<TrialBalanceResponse> { return this.http.post<TrialBalanceResponse>(`${this.BASE}/reports/trial-balance`, data); }
  getLedger(data: ReportRequest): Observable<LedgerResponse[]> { return this.http.post<LedgerResponse[]>(`${this.BASE}/reports/ledger`, data); }
  getBalanceSheet(data: ReportRequest): Observable<BalanceSheetResponse> { return this.http.post<BalanceSheetResponse>(`${this.BASE}/reports/balance-sheet`, data); }

  // Journal
  getJournalByAccount(accountNumber: string): Observable<JournalEntry[]> { return this.http.get<JournalEntry[]>(`${this.BASE}/history/${accountNumber}`); }
  getJournalById(id: number): Observable<JournalEntry> { return this.http.get<JournalEntry>(`${this.BASE}/history/entry-id/${id}`); }
  getAllJournals(): Observable<JournalEntry[]> { return this.http.get<JournalEntry[]>(`${this.BASE}/history/all`); }
  getJournalsByBranchId(branchId: number): Observable<JournalEntry[]> { return this.http.get<JournalEntry[]>(`${this.BASE}/history/branch/${branchId}`); }
  getTransactionHistory(customerId: number, startDate?: string, endDate?: string): Observable<JournalEntry[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<JournalEntry[]>(`${this.BASE}/history/customer/${customerId}`, { params });
  }

  exportStaffTransactionHistory(format: string, accountNumber?: string, branchId?: number, startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (accountNumber) params = params.set('accountNumber', accountNumber);
    if (branchId) params = params.set('branchId', branchId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.BASE}/history/export/staff`, {
      params,
      responseType: 'blob'
    });
  }

  exportTransactionHistory(customerId: number, format: string, accountNumber?: string, startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    if (accountNumber) params = params.set('accountNumber', accountNumber);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.BASE}/history/customer/${customerId}/export`, {
      params,
      responseType: 'blob'
    });
  }

  // Address Data
  getDivisions(): Observable<Division[]> {
    return this.http.get<any>(`${this.BASE}/division/all`).pipe(
      map(data => this.normalizeDivisions(data)),
      catchError(() => this.http.get<any>(`${this.BASE}/divisions`).pipe(map(data => this.normalizeDivisions(data)))),
      catchError(() => this.http.get<any>(`${this.BASE}/division`).pipe(map(data => this.normalizeDivisions(data)))),
      catchError(() => of([]))
    );
  }

  getDistrictsByDivision(divisionId: number): Observable<District[]> {
    return this.http.get<any>(`${this.BASE}/district/division/${divisionId}`).pipe(
      map(data => this.normalizeDistricts(data)),
      catchError(() => this.http.get<any>(`${this.BASE}/districts/division/${divisionId}`).pipe(map(data => this.normalizeDistricts(data)))),
      catchError(() => this.http.get<any>(`${this.BASE}/district/by-division/${divisionId}`).pipe(map(data => this.normalizeDistricts(data)))),
      catchError(() => of([]))
    );
  }

  getPoliceStationsByDistrict(districtId: number): Observable<PoliceStation[]> {
    return this.http.get<any>(`${this.BASE}/policestation/district/${districtId}`).pipe(
      map(data => this.normalizePoliceStations(data)),
      catchError(() => this.http.get<any>(`${this.BASE}/police-station/district/${districtId}`).pipe(map(data => this.normalizePoliceStations(data)))),
      catchError(() => this.http.get<any>(`${this.BASE}/police-stations/district/${districtId}`).pipe(map(data => this.normalizePoliceStations(data)))),
      catchError(() => of([]))
    );
  }

  getDivision(): Observable<Division[]> {
    return this.getDivisions();
  }

  getDistrictsByDivisionId(divisionId: number): Observable<District[]> {
    return this.getDistrictsByDivision(divisionId);
  }

  getPoliceStationByDistrictId(districtId: number): Observable<PoliceStation[]> {
    return this.getPoliceStationsByDistrict(districtId);
  }
}
