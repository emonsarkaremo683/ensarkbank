import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { JournalResponse } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/history/';

  getByAccountNumber(accountNumber: string): Observable<JournalResponse[]> {
    return this.http.get<JournalResponse[]>(`${this.url}${accountNumber}`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<JournalResponse> {
    return this.http.get<JournalResponse>(`${this.url}entry-id/${id}`).pipe(
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
