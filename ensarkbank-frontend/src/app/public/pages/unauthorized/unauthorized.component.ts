import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="unauthorized-page">
      <div class="unauthorized-card">
        <div class="icon">🔒</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <a routerLink="/login" class="btn-primary">Go to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-page {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #0a1628;
    }
    .unauthorized-card {
      text-align: center; padding: 48px; background: #0f1d32;
      border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
      max-width: 400px;
    }
    .icon { font-size: 64px; margin-bottom: 24px; }
    h1 { color: #e2e8f0; font-size: 24px; margin-bottom: 8px; }
    p { color: #64748b; margin-bottom: 24px; }
    .btn-primary {
      display: inline-block; padding: 12px 32px; background: #c9a84c;
      color: #0a1628; border-radius: 8px; text-decoration: none;
      font-weight: 600; transition: all 0.3s;
    }
    .btn-primary:hover { background: #d4b55e; transform: translateY(-1px); }
  `]
})
export class UnauthorizedComponent {}
