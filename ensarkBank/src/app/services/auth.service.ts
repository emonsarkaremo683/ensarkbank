import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/enums';

export interface AuthUser {
  token: string;
  email: string;
  role: Role;
  name: string;
  userId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: any;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private userSignal = signal<AuthUser | null>(this.loadUser());

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);
  readonly role = computed(() => this.userSignal()?.role ?? null);
  readonly userName = computed(() => this.userSignal()?.name ?? '');
  readonly userEmail = computed(() => this.userSignal()?.email ?? '');

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        const authUser: AuthUser = {
          token: res.token,
          email: res.user?.email ?? '',
          role: res.user?.role ?? 'CUSTOMER',
          name: res.user?.name ?? '',
          userId: res.user?.id ?? 0,
        };
        this.saveUser(authUser);
        this.userSignal.set(authUser);
      }),
    );
  }

  sendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/send-verification`, { email });
  }

  logout(): void {
    this.clearUser();
    this.userSignal.set(null);
  }

  getToken(): string | null {
    return this.userSignal()?.token ?? null;
  }

  hasRole(...allowed: Role[]): boolean {
    const r = this.role();
    return r !== null && allowed.includes(r);
  }

  private saveUser(user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadUser(): AuthUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private clearUser(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
