import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UserInfo, ForgetPasswordRequest, ResetPasswordRequest } from '../models';
import { CryptoService } from './crypto.service';
import { TokenExpirationService } from './token-expiration.service';
import { Role } from '../enums/role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'bank_token';
  private readonly USER_KEY = 'bank_user';

  currentUser = signal<UserInfo | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(
    private http: HttpClient,
    private router: Router,
    private crypto: CryptoService,
    private tokenExpiration: TokenExpirationService
  ) {
    this.currentUser.set(this.loadUser());
    this.tokenExpiration.startTimerFromStorage();
     this.tokenExpiration.expired$.subscribe(() => this.logout());
  }

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
    this.tokenExpiration.stopTimer();
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
    const user = response.user as any;
    if (user && user.profile && !user.imageUrl) {
      const subfolder = user.role === 'CUSTOMER' ? 'customer' : 'employee';
      user.imageUrl = `${environment.apiUrl}/uploads/${subfolder}/${user.profile}`;
    }
    localStorage.setItem(this.USER_KEY, this.crypto.encryptObject(user));
    this.currentUser.set(user);
    this.tokenExpiration.startTimer(encryptedToken);
  }

  private loadUser(): UserInfo | null {
    const encryptedUser = localStorage.getItem(this.USER_KEY);
    if (!encryptedUser) return null;
    try {
      const user = this.crypto.decryptObject<any>(encryptedUser);
      if (user && user.profile && !user.imageUrl) {
        const subfolder = user.role === 'CUSTOMER' ? 'customer' : 'employee';
        user.imageUrl = `${environment.apiUrl}/uploads/${subfolder}/${user.profile}`;
      }
      return user;
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
