import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, UserInfo, ForgetPasswordRequest, ResetPasswordRequest } from '../models';
import { CryptoService } from './crypto.service';
import { Role } from '../enums/role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8085/api/auth';
  private readonly TOKEN_KEY = 'bank_token';
  private readonly USER_KEY = 'bank_user';

  currentUser = signal<UserInfo | null>(this.loadUser());
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
    private crypto: CryptoService
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, {
      email: request.email,
      password: request.password
    }).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, formData);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.API_URL}/verify-email?token=${token}`);
  }

  sendVerificationEmail(): Observable<any> {
    return this.http.post(`${this.API_URL}/send-verification`, {});
  }

  forgotPassword(request: ForgetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, request);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(roles: Role[]): boolean {
    const user = this.currentUser();
    if (!user) return false;
    return roles.includes(user.role as Role);
  }

  isCustomer(): boolean {
    return this.currentUser()?.role === Role.CUSTOMER;
  }

  isStaff(): boolean {
    return !this.isCustomer();
  }

  private setSession(response: LoginResponse): void {
    const encryptedToken = this.crypto.encrypt(response.token);
    localStorage.setItem(this.TOKEN_KEY, encryptedToken);
    localStorage.setItem(this.USER_KEY, this.crypto.encryptObject(response.user));
    this.currentUser.set(response.user);
  }

  private loadUser(): UserInfo | null {
    const encryptedUser = localStorage.getItem(this.USER_KEY);
    if (!encryptedUser) return null;
    try {
      return this.crypto.decryptObject<UserInfo>(encryptedUser);
    } catch {
      return null;
    }
  }

  getDecryptedToken(): string | null {
    const encrypted = this.getToken();
    if (!encrypted) return null;
    return this.crypto.decrypt(encrypted);
  }
}
