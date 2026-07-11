import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <div class="logo-icon">EB</div>
          </div>
          <h1>EnsarBank</h1>
          <p>Sign in to your account</p>
        </div>

        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" placeholder="admin@ensarkbank.com" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" placeholder="Enter password" required />
          </div>
          <div class="d-flex justify-content-between align-items-center mb-4">
            <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
          </div>
          <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Sign In
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%);
      padding: 20px;
    }
    .auth-card {
      width: 100%; max-width: 420px; background: var(--surface);
      border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { margin-bottom: 16px; }
    .logo-icon {
      width: 56px; height: 56px; background: var(--primary-light);
      border-radius: 14px; display: inline-flex; align-items: center; justify-content: center;
      color: white; font-family: var(--font-heading); font-weight: 800; font-size: 20px;
    }
    .auth-header h1 {
      font-family: var(--font-heading); font-size: 24px; font-weight: 800;
      color: var(--text-primary); margin-bottom: 4px;
    }
    .auth-header p { color: var(--text-secondary); font-size: 14px; }
    .forgot-link { font-size: 13px; color: var(--primary-light); text-decoration: none; }
    .forgot-link:hover { text-decoration: underline; }
    .btn-primary { border-radius: 10px; font-weight: 600; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid credentials');
      },
    });
  }
}
