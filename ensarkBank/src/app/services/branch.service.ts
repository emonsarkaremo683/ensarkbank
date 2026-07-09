import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Branch } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/branches';

  getAll(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.url}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(branch: Branch): Observable<Branch> {
    return this.http.post<Branch>(this.url, branch).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, branch: Branch): Observable<Branch> {
    return this.http.put<Branch>(`${this.url}/${id}`, branch).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.url}/${id}`).pipe(
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
