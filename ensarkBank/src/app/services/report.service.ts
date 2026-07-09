import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  ReportRequest,
  LedgerResponse,
  TrialBalanceResponse,
  BalanceSheetResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/reports/';

  getLedger(branchId: number, accountNumber: string, request: ReportRequest): Observable<LedgerResponse> {
    return this.http.post<LedgerResponse>(`${this.apiUrl}ledger/${branchId}/${accountNumber}`, request).pipe(
      catchError(this.handleError)
    );
  }

  getLedgers(request: ReportRequest): Observable<LedgerResponse[]> {
    return this.http.post<LedgerResponse[]>(`${this.apiUrl}ledger`, request).pipe(
      catchError(this.handleError)
    );
  }

  getTrialBalance(request: ReportRequest): Observable<TrialBalanceResponse> {
    return this.http.post<TrialBalanceResponse>(`${this.apiUrl}trial-balance`, request).pipe(
      catchError(this.handleError)
    );
  }

  getBalanceSheet(request: ReportRequest): Observable<BalanceSheetResponse> {
    return this.http.post<BalanceSheetResponse>(`${this.apiUrl}balance-sheet`, request).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.status === 0
      ? 'Cannot connect to server. Please ensure the backend is running on port 8085.'
      : error.error?.message || error.error?.error || error.statusText || 'Server error';
    return throwError(() => new Error(message));
  }
}
