import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { EmployeeResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8085/api/employee/';

  getAll(): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.url}${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getByBranchId(branchId: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.url}branch/${branchId}`).pipe(
      catchError(this.handleError)
    );
  }

  create(data: FormData): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(this.url, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.error?.message || error.statusText || 'Server error';
    console.error('EmployeeService Error:', message);
    return throwError(() => new Error(message));
  }
}
