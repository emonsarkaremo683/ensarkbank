import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { LoanApplicationRequest, LoanApplicationResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/loans/';

  apply(request: LoanApplicationRequest): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.url}apply`, request).pipe(
      catchError(this.handleError)
    );
  }

  getAll(): Observable<LoanApplicationResponse[]> {
    return this.http.get<LoanApplicationResponse[]>(`${this.url}all`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<LoanApplicationResponse> {
    return this.http.get<LoanApplicationResponse>(`${this.url}${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByAccountId(accountId: number): Observable<LoanApplicationResponse[]> {
    return this.http.get<LoanApplicationResponse[]>(`${this.url}account/${accountId}`).pipe(
      catchError(this.handleError)
    );
  }

  approve(id: number): Observable<LoanApplicationResponse> {
    return this.http.put<LoanApplicationResponse>(`${this.url}${id}/approve`, null).pipe(
      catchError(this.handleError)
    );
  }

  reject(id: number, reason: string): Observable<LoanApplicationResponse> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<LoanApplicationResponse>(`${this.url}${id}/reject`, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  disburse(id: number): Observable<LoanApplicationResponse> {
    return this.http.post<LoanApplicationResponse>(`${this.url}${id}/disburse`, null).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.status === 0
      ? 'Cannot connect to server. Please ensure the backend is running on port 8085.'
      : error.error?.message || error.error?.error || error.statusText || 'Server error';
    console.error('LoanService Error:', message);
    return throwError(() => new Error(message));
  }
}
