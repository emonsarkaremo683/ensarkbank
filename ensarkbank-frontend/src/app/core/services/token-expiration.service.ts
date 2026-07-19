import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { CryptoService } from './crypto.service';

@Injectable({ providedIn: 'root' })
export class TokenExpirationService {
  private readonly TOKEN_KEY = 'bank_token';

  private crypto = inject(CryptoService);

  private timerId: ReturnType<typeof setTimeout> | null = null;
  private expiryTime: number | null = null;

  /** Emits whenever the token expires locally. AuthService subscribes to this
   *  so that clearing session state (signal + storage + redirect) happens in
   *  exactly one place instead of being duplicated/forgotten here. */
  readonly expired$ = new Subject<void>();

  startTimer(encryptedToken: string): void {
    this.stopTimer();

    const token = this.crypto.decrypt(encryptedToken);
    if (!token) {
      this.forceLogout();
      return;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload || !payload['exp']) {
      return;
    }

    this.expiryTime = payload['exp'] * 1000;
    const now = Date.now();
    const delay = this.expiryTime - now;

    if (delay <= 0) {
      this.forceLogout();
      return;
    }

    this.timerId = setTimeout(() => {
      this.forceLogout();
    }, delay);
  }

  stopTimer(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.expiryTime = null;
  }

  getRemainingTime(): number {
    if (!this.expiryTime) return 0;
    return Math.max(0, this.expiryTime - Date.now());
  }

  isExpired(): boolean {
    if (!this.expiryTime) return false;
    return Date.now() >= this.expiryTime;
  }

  startTimerFromStorage(): void {
    const encrypted = localStorage.getItem(this.TOKEN_KEY);
    if (!encrypted) return;

    try {
      const token = this.crypto.decrypt(encrypted);
      if (!token) return;

      const payload = this.decodeJwtPayload(token);
      if (!payload || !payload['exp']) return;

      this.startTimer(encrypted);
    } catch {
      // corrupted token — force logout
      this.forceLogout();
    }
  }

  private decodeJwtPayload(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = atob(parts[1]);
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  private forceLogout(): void {
    this.stopTimer();
    this.expired$.next();
  }
}