import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo"><div class="logo-icon">EB</div></div>
          <h1>Reset Password</h1>
          <p>Enter your new password</p>
        </div>
        @if (success()) {
          <div class="alert alert-success">{{ success() }}</div>
        }
        @if (error()) {
          <div class="alert alert-danger">{{ error() }}</div>
        }
        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">New Password</label>
            <input type="password" class="form-control" [(ngModel)]="newPassword" name="newPassword" required />
          </div>
          <div class="mb-4">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-control" [(ngModel)]="confirmPassword" name="confirmPassword" required />
          </div>
          <button type="submit" class="btn btn-primary w-100 py-2" [disabled]="loading()">
            @if (loading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
            Reset Password
          </button>
        </form>
        <div class="text-center mt-3">
          <a routerLink="/login" class="forgot-link">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%); padding: 20px; }
    .auth-card { width: 100%; max-width: 420px; background: var(--surface); border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { margin-bottom: 16px; }
    .logo-icon { width: 56px; height: 56px; background: var(--primary-light); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; color: white; font-family: var(--font-heading); font-weight: 800; font-size: 20px; }
    .auth-header h1 { font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
    .auth-header p { color: var(--text-secondary); font-size: 14px; }
    .forgot-link { font-size: 13px; color: var(--primary-light); text-decoration: none; }
    .btn-primary { border-radius: 10px; font-weight: 600; }
  `]
})
export class ResetPasswordComponent {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = signal(false);
  success = signal('');
  error = signal('');

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    this.loading.set(true);
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.success.set(res);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => { this.loading.set(false); this.error.set(err.error?.message || 'Failed to reset password'); },
    });
  }
}
