import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ATMRequest, ATMResponse } from '../models';
import { ATMStatus } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AtmService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/atm`;

  getAll(): Observable<ATMResponse[]> {
    return this.http.get<ATMResponse[]>(`${this.base}/all`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<ATMResponse> {
    return this.http.get<ATMResponse>(`${this.base}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByBranchId(branchId: number): Observable<ATMResponse[]> {
    return this.http.get<ATMResponse[]>(`${this.base}/branch/${branchId}`).pipe(
      catchError(this.handleError)
    );
  }

  create(request: ATMRequest): Observable<ATMResponse> {
    return this.http.post<ATMResponse>(this.base, request).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, request: ATMRequest): Observable<ATMResponse> {
    return this.http.put<ATMResponse>(`${this.base}/update/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  updateStatus(id: number, status: ATMStatus): Observable<ATMResponse> {
    return this.http.patch<ATMResponse>(`${this.base}/${id}/status`, null, {
      params: { status }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.status === 0
      ? 'Cannot connect to server. Please ensure the backend is running on port 8085.'
      : error.error?.message || error.error?.error || error.statusText || 'Server error';
    console.error('AtmService Error:', message);
    return throwError(() => new Error(message));
  }
}
