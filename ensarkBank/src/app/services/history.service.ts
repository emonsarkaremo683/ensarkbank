import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { History } from '../models/history.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/history/';

  getHistoryByAccountNumber(accountNumber: string): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}${accountNumber}`);
  }
  getHistoryById(id: number): Observable<History> {
    return this.http.get<History>(`${this.apiUrl}entry-id/${id}`);
  }
}
