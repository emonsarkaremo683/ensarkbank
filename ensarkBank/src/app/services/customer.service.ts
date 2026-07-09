import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CustomerRequest, CustomerResponse, AccountResponse, JournalResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/customer/';

  getAll(): Observable<CustomerResponse[]> {
    return this.http.get<CustomerResponse[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.url}${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(data: FormData): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.url, data).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, data: FormData): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.url}${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  updateKycStatus(id: number, status: string): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.url}${id}/kyc-status`, null, {
      params: { status }
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateKyc(id: number, data: FormData): Observable<CustomerResponse> {
    return this.http.put<CustomerResponse>(`${this.url}${id}/kyc`, data).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(id: number, profile: File): Observable<CustomerResponse> {
    const formData = new FormData();
    formData.append('profile', profile, profile.name);
    return this.http.put<CustomerResponse>(`${this.url}${id}/profile`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getAccountsByCustomerId(customerId: number): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.url}customer/${customerId}`).pipe(
      catchError(this.handleError)
    );
  }

  getHistory(customerId: number, startDate: string, endDate: string): Observable<JournalResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<JournalResponse[]>(`${this.url}history/customer/${customerId}`, { params }).pipe(
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
