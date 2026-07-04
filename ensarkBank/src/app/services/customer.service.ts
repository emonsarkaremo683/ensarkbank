import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CustomerRequest, CustomerResponse } from '../models';
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

  private handleError(error: any) {
    const message = error.error?.message || error.statusText || 'Server error';
    console.error('CustomerService Error:', message);
    return throwError(() => new Error(message));
  }
}
