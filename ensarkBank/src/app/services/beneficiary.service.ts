import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { BeneficiaryRequest, BeneficiaryResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BeneficiaryService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/beneficiary/';

  getAll(): Observable<BeneficiaryResponse[]> {
    return this.http.get<BeneficiaryResponse[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<BeneficiaryResponse> {
    return this.http.get<BeneficiaryResponse>(`${this.url}${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(beneficiary: BeneficiaryRequest): Observable<BeneficiaryResponse> {
    return this.http.post<BeneficiaryResponse>(this.url, beneficiary).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.status === 0
      ? 'Cannot connect to server. Please ensure the backend is running on port 8085.'
      : error.error?.message || error.error?.error || error.statusText || 'Server error';
    console.error('BeneficiaryService Error:', message);
    return throwError(() => new Error(message));
  }
}
