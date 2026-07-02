import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountTransactionRequest, AccountTransactionResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8085/api/account-transaction/';

  getAll(): Observable<AccountTransactionResponse[]> {
    return this.http.get<AccountTransactionResponse[]>(`${this.url}all/`).pipe(
      catchError(this.handleError)
    );
  }

  getByAccountNumber(accountNumber: string): Observable<AccountTransactionResponse> {
    return this.http.get<AccountTransactionResponse>(`${this.url}accountNumber/${accountNumber}`).pipe(
      catchError(this.handleError)
    );
  }

  transfer(request: AccountTransactionRequest): Observable<AccountTransactionResponse> {
    return this.http.post<AccountTransactionResponse>(this.url, request).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.error?.message || error.statusText || 'Server error';
    console.error('TransactionService Error:', message);
    return throwError(() => new Error(message));
  }
}
