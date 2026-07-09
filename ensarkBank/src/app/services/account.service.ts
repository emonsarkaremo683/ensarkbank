import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AccountRequest, AccountResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/account/';

  getAll(): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.url}all/`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.url}${id}`).pipe(
      catchError(this.handleError)
    );
  }
  getByAccountNumber(accountNumber: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.url}account-number/${accountNumber}`).pipe(
      catchError(this.handleError)
    );
  }

  getByBranchId(branchId: number): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.url}branch/${branchId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByCustomerId(customerId: number): Observable<AccountResponse[]> {
    return this.http.get<AccountResponse[]>(`${this.url}customer/${customerId}`).pipe(
      catchError(this.handleError)
    );
  }

  create(account: AccountRequest, photo: File, nidFront: File, nidBack: File): Observable<AccountResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(account));
    formData.append('photo', photo);
    formData.append('nid_front', nidFront);
    formData.append('nid_back', nidBack);

    return this.http.post<AccountResponse>(this.url, formData).pipe(
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
