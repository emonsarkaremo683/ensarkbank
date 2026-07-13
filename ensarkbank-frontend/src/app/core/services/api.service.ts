import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Branch, CustomerRequest, CustomerResponse, EmployeeRequest, EmployeeResponse,
  AccountRequest, AccountResponse, AccountTransactionRequest, AccountTransactionResponse,
  OtpInitiateResponse, OtpVerifyRequest, BeneficiaryRequest, BeneficiaryResponse,
  LoanApplicationRequest, LoanResponse, CardRequest, CardResponse,
  ATMRequest, ATMResponse, ATMTransactionRequest, ATMTransactionResponse,
  BalanceCheckRequest, CashierTransactionRequest, CashierTransactionResponse,
  ReportRequest, TrialBalanceResponse, LedgerResponse, BalanceSheetResponse,
  Transaction, JournalEntry, Division, District, PoliceStation
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE = 'http://localhost:8085/api';

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
  getEmployeeById(id: number): Observable<EmployeeResponse> { return this.http.get<EmployeeResponse>(`${this.BASE}/employee/${id}`); }
  createEmployee(formData: FormData): Observable<EmployeeResponse> { return this.http.post<EmployeeResponse>(`${this.BASE}/employee/`, formData); }
  updateEmployee(id: number, formData: FormData): Observable<EmployeeResponse> { return this.http.put<EmployeeResponse>(`${this.BASE}/employee/${id}`, formData); }
  deleteEmployee(id: number): Observable<void> { return this.http.delete<void>(`${this.BASE}/employee/${id}`); }

  // Branch
  getBranches(): Observable<Branch[]> { return this.http.get<Branch[]>(`${this.BASE}/branches`); }
  getBranchById(id: number): Observable<Branch> { return this.http.get<Branch>(`${this.BASE}/branches/${id}`); }
  createBranch(data: Partial<Branch>): Observable<Branch> { return this.http.post<Branch>(`${this.BASE}/branches`, data); }
  updateBranch(id: number, data: Partial<Branch>): Observable<Branch> { return this.http.put<Branch>(`${this.BASE}/branches/${id}`, data); }
  deleteBranch(id: number): Observable<void> { return this.http.delete<void>(`${this.BASE}/branches/${id}`); }

  // Customer
  getCustomers(): Observable<CustomerResponse[]> { return this.http.get<CustomerResponse[]>(`${this.BASE}/customer/`); }
  getCustomerById(id: number): Observable<CustomerResponse> { return this.http.get<CustomerResponse>(`${this.BASE}/customer/${id}`); }
  getCustomerByEmail(email: string): Observable<CustomerResponse> { return this.http.get<CustomerResponse>(`${this.BASE}/customer/email/${email}`); }
  createCustomer(formData: FormData): Observable<CustomerResponse> { return this.http.post<CustomerResponse>(`${this.BASE}/customer/`, formData); }
  updateCustomer(id: number, formData: FormData): Observable<CustomerResponse> { return this.http.put<CustomerResponse>(`${this.BASE}/customer/${id}`, formData); }
  getCustomerHistory(id: number): Observable<any> { return this.http.get(`${this.BASE}/customer/history/customer/${id}`); }
  updateKycStatus(id: number, status: string): Observable<CustomerResponse> { return this.http.put<CustomerResponse>(`${this.BASE}/customer/${id}/kyc-status`, null, { params: { status } }); }
  uploadKycDocuments(customerId: number, documents: FormData): Observable<CustomerResponse> { return this.http.patch<CustomerResponse>(`${this.BASE}/kyc/customer/${customerId}/upload`, documents); }

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
  createAccount(data: AccountRequest | FormData): Observable<AccountResponse> { return this.http.post<AccountResponse>(`${this.BASE}/account/create`, data); }
  updateAccountStatus(id: number, status: string): Observable<AccountResponse> { return this.http.patch<AccountResponse>(`${this.BASE}/account/${id}/status/${status}`, null); }

  // Transactions
  processTransaction(data: AccountTransactionRequest): Observable<AccountTransactionResponse> { return this.http.post<AccountTransactionResponse>(`${this.BASE}/account-transaction/`, data); }
  initiateOnlineTransaction(data: AccountTransactionRequest): Observable<OtpInitiateResponse> { return this.http.post<OtpInitiateResponse>(`${this.BASE}/account-transaction/online/initiate`, data); }
  verifyOnlineTransaction(data: OtpVerifyRequest): Observable<AccountTransactionResponse> { return this.http.post<AccountTransactionResponse>(`${this.BASE}/account-transaction/online/verify`, data); }
  getTransactions(): Observable<AccountTransactionResponse[]> { return this.http.get<AccountTransactionResponse[]>(`${this.BASE}/account-transaction/all`); }
  getTransactionsByAccount(accountNumber: string): Observable<AccountTransactionResponse[]> { return this.http.get<AccountTransactionResponse[]>(`${this.BASE}/account-transaction/accountNumber/${accountNumber}`); }

  // Loans
  getLoans(): Observable<LoanResponse[]> { return this.http.get<LoanResponse[]>(`${this.BASE}/loans/all`); }
  getLoanById(id: number): Observable<LoanResponse> { return this.http.get<LoanResponse>(`${this.BASE}/loans/${id}`); }
  applyLoan(data: LoanApplicationRequest): Observable<LoanResponse> { return this.http.post<LoanResponse>(`${this.BASE}/loans/apply`, data); }
  approveLoan(id: number): Observable<LoanResponse> { return this.http.put<LoanResponse>(`${this.BASE}/loans/${id}/approve`, {}); }
  rejectLoan(id: number, reason?: string): Observable<LoanResponse> { return this.http.put<LoanResponse>(`${this.BASE}/loans/${id}/reject`, null, { params: reason ? { reason } : {} }); }
  disburseLoan(id: number): Observable<LoanResponse> { return this.http.post<LoanResponse>(`${this.BASE}/loans/${id}/disburse`, {}); }
  repayLoan(id: number, amount: number): Observable<any> { return this.http.post(`${this.BASE}/loans/${id}/repay`, { amount }); }

  // Cards
  getCards(): Observable<CardResponse[]> { return this.http.get<CardResponse[]>(`${this.BASE}/card/`); }
  getCardById(id: number): Observable<CardResponse> { return this.http.get<CardResponse>(`${this.BASE}/card/${id}`); }
  getCardsByAccount(accountId: number): Observable<CardResponse[]> { return this.http.get<CardResponse[]>(`${this.BASE}/card/account/${accountId}`); }
  createCard(data: CardRequest): Observable<CardResponse> { return this.http.post<CardResponse>(`${this.BASE}/card/`, data); }
  updateCardStatus(id: number, status: string): Observable<CardResponse> { return this.http.patch<CardResponse>(`${this.BASE}/card/${id}/status`, null, { params: { status } }); }
  changeCardPin(id: number, oldPin: string, newPin: string): Observable<any> { return this.http.patch(`${this.BASE}/card/${id}/change-pin`, null, { params: { pin: newPin } }); }

  // ATM
  getATMs(): Observable<ATMResponse[]> { return this.http.get<ATMResponse[]>(`${this.BASE}/atm/all`); }
  getATMById(id: number): Observable<ATMResponse> { return this.http.get<ATMResponse>(`${this.BASE}/atm/${id}`); }
  createATM(data: ATMRequest): Observable<ATMResponse> { return this.http.post<ATMResponse>(`${this.BASE}/atm`, data); }
  updateATMStatus(id: number, status: string): Observable<ATMResponse> { return this.http.patch<ATMResponse>(`${this.BASE}/atm/${id}/status`, null, { params: { status } }); }

  // ATM Transactions
  processATMTransaction(data: ATMTransactionRequest): Observable<ATMTransactionResponse> { return this.http.post<ATMTransactionResponse>(`${this.BASE}/atm-transactions`, data); }
  getATMTransactions(): Observable<ATMTransactionResponse[]> { return this.http.get<ATMTransactionResponse[]>(`${this.BASE}/atm-transactions`); }
  getATMTransactionsByATM(atmId: number): Observable<ATMTransactionResponse[]> { return this.http.get<ATMTransactionResponse[]>(`${this.BASE}/atm-transactions/atm/${atmId}`); }
  checkATMBalance(data: BalanceCheckRequest): Observable<any> { return this.http.post(`${this.BASE}/atm-transactions/balance`, data); }

  // Cashier Transactions
  getCashierTransactions(): Observable<CashierTransactionResponse[]> { return this.http.get<CashierTransactionResponse[]>(`${this.BASE}/cashier-transactions`); }
  processCashierTransaction(data: CashierTransactionRequest): Observable<CashierTransactionResponse> { return this.http.post<CashierTransactionResponse>(`${this.BASE}/cashier-transactions`, data); }

  // Reports
  getTrialBalance(data: ReportRequest): Observable<TrialBalanceResponse> { return this.http.post<TrialBalanceResponse>(`${this.BASE}/reports/trial-balance`, data); }
  getLedger(data: ReportRequest & { accountNumber: string }): Observable<LedgerResponse> { return this.http.post<LedgerResponse>(`${this.BASE}/reports/ledger`, data); }
  getBalanceSheet(data: ReportRequest): Observable<BalanceSheetResponse> { return this.http.post<BalanceSheetResponse>(`${this.BASE}/reports/balance-sheet`, data); }

  // Journal
  getJournalByAccount(accountNumber: string): Observable<JournalEntry[]> { return this.http.get<JournalEntry[]>(`${this.BASE}/history/${accountNumber}`); }

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
