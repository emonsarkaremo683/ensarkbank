import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/role';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search customers, accounts..." class="search-input" />
        </div>
      </div>

      <div class="topbar-right">
        <div class="branch-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          <span>Head Office</span>
        </div>

        <button class="icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="notification-dot"></span>
        </button>

        <div class="user-menu" (click)="showMenu.update(v => !v)">
          <div class="avatar">{{ userInitials() }}</div>
          <div class="user-info">
            <span class="user-name">{{ userName() }}</span>
            <span class="user-role">{{ userRole() }}</span>
          </div>
          @if (showMenu()) {
            <div class="dropdown-menu">
              <a class="dropdown-item" (click)="auth.logout()">Logout</a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 64px; background: var(--surface); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 50;
    }
    .topbar-left { flex: 1; max-width: 400px; }
    .search-box {
      display: flex; align-items: center; gap: 10px;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 8px 14px;
    }
    .search-input {
      border: none; background: none; outline: none; font-size: 13px;
      color: var(--text-primary); width: 100%;
    }
    .search-input::placeholder { color: var(--text-muted); }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .branch-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; background: var(--bg); border: 1px solid var(--border);
      border-radius: 8px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
    }
    .icon-btn {
      position: relative; background: none; border: none;
      color: var(--text-secondary); cursor: pointer; padding: 8px;
      border-radius: 8px;
    }
    .icon-btn:hover { background: var(--bg); }
    .notification-dot {
      position: absolute; top: 6px; right: 6px;
      width: 8px; height: 8px; background: var(--danger);
      border-radius: 50%; border: 2px solid var(--surface);
    }
    .user-menu { display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative; }
    .avatar {
      width: 36px; height: 36px; background: var(--primary-light);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: white; font-size: 13px; font-weight: 700; font-family: var(--font-heading);
    }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-role { font-size: 11px; color: var(--text-muted); }
    .dropdown-menu {
      position: absolute; top: 100%; right: 0; margin-top: 8px;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      min-width: 160px; padding: 4px; z-index: 100;
    }
    .dropdown-item {
      display: block; padding: 8px 12px; border-radius: 6px;
      font-size: 13px; color: var(--text-primary); text-decoration: none;
      cursor: pointer;
    }
    .dropdown-item:hover { background: var(--bg); }
  `]
})
export class TopbarComponent {
  auth = inject(AuthService);
  showMenu = signal(false);

  userName(): string {
    const user = this.auth.currentUser();
    return (user as any)?.name || user?.email || 'User';
  }

  userRole(): string {
    return this.auth.userRole() || '';
  }

  userInitials(): string {
    const name = this.userName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
