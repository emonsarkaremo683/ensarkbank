import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Division, District, PoliceStation } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/division/';

  getAllDivisions(): Observable<Division[]> {
    return this.http.get<Division[]>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  createDivision(division: Division): Observable<Division> {
    return this.http.post<Division>(this.url, division).pipe(
      catchError(this.handleError)
    );
  }

  deleteDivision(id: number): Observable<string> {
    return this.http.delete<string>(`${this.url}${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllDistricts(): Observable<District[]> {
    return this.http.get<District[]>(environment.apiUrl + '/district/').pipe(
      catchError(this.handleError)
    );
  }

  createDistrict(district: District): Observable<District> {
    return this.http.post<District>(environment.apiUrl + '/district/', district).pipe(
      catchError(this.handleError)
    );
  }

  getDistrictByDivisionId(id: number): Observable<District> {
    return this.http.get<District>(environment.apiUrl + `/division/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  updateDistrict(id: number, district: District): Observable<District> {
    return this.http.put<District>(environment.apiUrl + `/district/${id}`, district).pipe(
      catchError(this.handleError)
    );
  }

  deleteDistrict(id: number): Observable<string> {
    return this.http.delete<string>(environment.apiUrl + `/district/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAllPoliceStations(): Observable<PoliceStation[]> {
    return this.http.get<PoliceStation[]>(environment.apiUrl + '/policestation/').pipe(
      catchError(this.handleError)
    );
  }

  createPoliceStation(ps: PoliceStation): Observable<PoliceStation> {
    return this.http.post<PoliceStation>(environment.apiUrl + '/policestation/', ps).pipe(
      catchError(this.handleError)
    );
  }

  deletePoliceStation(id: number): Observable<string> {
    return this.http.delete<string>(environment.apiUrl + `/policestation/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    const message = error.status === 0
      ? 'Cannot connect to server. Please ensure the backend is running on port 8085.'
      : error.error?.message || error.error?.error || error.statusText || 'Server error';
    console.error('AddressService Error:', message);
    return throwError(() => new Error(message));
  }
}
