import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  ATMTransactionRequest,
  ATMTransactionResponse,
  RefillRequest
} from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AtmTransactionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/atm-transactions`;

  getAll(): Observable<ATMTransactionResponse[]> {
    return this.http.get<ATMTransactionResponse[]>(this.base).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<ATMTransactionResponse> {
    return this.http.get<ATMTransactionResponse>(`${this.base}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByAtmId(atmId: number): Observable<ATMTransactionResponse[]> {
    return this.http.get<ATMTransactionResponse[]>(`${this.base}/atm/${atmId}`).pipe(
      catchError(this.handleError)
    );
  }

  transact(request: ATMTransactionRequest): Observable<ATMTransactionResponse> {
    return this.http.post<ATMTransactionResponse>(this.base, request).pipe(
      catchError(this.handleError)
    );
  }

  refill(request: RefillRequest): Observable<ATMTransactionResponse> {
    const params = new HttpParams().set('amount', request.amount.toString());
    return this.http.post<ATMTransactionResponse>(
      `${this.base}/${request.atmId}/refill`,
      null,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  checkBalance(cardNumber: string, pin: string): Observable<number> {
    return this.http.post<number>(`${this.base}/balance`, { cardNumber, pin }).pipe(
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
