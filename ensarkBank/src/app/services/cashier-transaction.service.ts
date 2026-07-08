import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountResponse, CashierTransactionRequest, CashierTransactionResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CashierTransactionService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/cashier-transactions';


  getAll(): Observable<CashierTransactionResponse[]> {
    return this.http.get<CashierTransactionResponse[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<CashierTransactionResponse> {
    return this.http.get<CashierTransactionResponse>(`${this.url}/${id}`).pipe(
      catchError(this.handleError)
    );
  }



  create(request: CashierTransactionRequest): Observable<CashierTransactionResponse> {
    return this.http.post<CashierTransactionResponse>(this.url, request).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, request: CashierTransactionRequest): Observable<CashierTransactionResponse> {
    return this.http.put<CashierTransactionResponse>(`${this.url}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.status === 0
      ? 'Cannot connect to server. Please ensure the backend is running on port 8085.'
      : error.error?.message || error.error?.error || error.statusText || 'Server error';
    console.error('CashierTransactionService Error:', message);
    return throwError(() => new Error(message));
  }
}
