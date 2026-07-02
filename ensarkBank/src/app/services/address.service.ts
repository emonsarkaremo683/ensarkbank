import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Division, District, PoliceStation } from '../models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);

  getAllDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>('http://localhost:8085/api/division/').pipe(
      catchError(this.handleError)
    );
  }

  createDivision(division: Division): Observable<Division> {
    return this.http.post<Division>('http://localhost:8085/api/division/', division).pipe(
      catchError(this.handleError)
    );
  }

  deleteDivision(id: number): Observable<string> {
    return this.http.delete<string>(`http://localhost:8085/api/division/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllDistricts(): Observable<District[]> {
    return this.http.get<District[]>('http://localhost:8085/api/district/').pipe(
      catchError(this.handleError)
    );
  }

  createDistrict(district: District): Observable<District> {
    return this.http.post<District>('http://localhost:8085/api/district/', district).pipe(
      catchError(this.handleError)
    );
  }

  updateDistrict(id: number, district: District): Observable<District> {
    return this.http.put<District>(`http://localhost:8085/api/district/${id}`, district).pipe(
      catchError(this.handleError)
    );
  }

  deleteDistrict(id: number): Observable<string> {
    return this.http.delete<string>(`http://localhost:8085/api/district/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllPoliceStations(): Observable<PoliceStation[]> {
    return this.http.get<PoliceStation[]>('http://localhost:8085/api/policestation/').pipe(
      catchError(this.handleError)
    );
  }

  createPoliceStation(ps: PoliceStation): Observable<PoliceStation> {
    return this.http.post<PoliceStation>('http://localhost:8085/api/policestation/', ps).pipe(
      catchError(this.handleError)
    );
  }

  deletePoliceStation(id: number): Observable<string> {
    return this.http.delete<string>(`http://localhost:8085/api/policestation/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.error?.message || error.statusText || 'Server error';
    console.error('AddressService Error:', message);
    return throwError(() => new Error(message));
  }
}
