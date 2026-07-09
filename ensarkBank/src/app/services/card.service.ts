import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CardRequest, CardResponse } from '../models';
import { CardStatus, CardType } from '../models/enums';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/card/';

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

  updateStatus(cardId: number, status: CardStatus): Observable<CardResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<CardResponse>(`${this.url}${cardId}/status`, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  updateType(cardId: number, type: CardType): Observable<CardResponse> {
    const params = new HttpParams().set('type', type);
    return this.http.patch<CardResponse>(`${this.url}${cardId}/type`, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  enableInternational(cardId: number, enabled: boolean): Observable<CardResponse> {
    const params = new HttpParams().set('enabled', enabled.toString());
    return this.http.patch<CardResponse>(`${this.url}${cardId}/international`, null, { params }).pipe(
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
