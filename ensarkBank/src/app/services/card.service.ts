import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CardRequest, CardResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8085/api/card/';

  getAll(): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  getByAccountId(accountId: number): Observable<CardResponse> {
    return this.http.get<CardResponse>(`${this.url}account/${accountId}`).pipe(
      catchError(this.handleError)
    );
  }

  getByCustomerId(customerId: number): Observable<CardResponse> {
    return this.http.get<CardResponse>(`${this.url}customer/${customerId}`).pipe(
      catchError(this.handleError)
    );
  }

  create(card: CardRequest): Observable<CardResponse> {
    return this.http.post<CardResponse>(this.url, card).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.error?.message || error.statusText || 'Server error';
    console.error('CardService Error:', message);
    return throwError(() => new Error(message));
  }
}
