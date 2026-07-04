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

  create(account: AccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.url, account).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.error?.message || error.statusText || 'Server error';
    console.error('AccountService Error:', message);
    return throwError(() => new Error(message));
  }
}
