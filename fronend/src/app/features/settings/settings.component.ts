import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header"><h1>Settings</h1><p>User profile and preferences</p></div>

    <div class="row g-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><strong>Profile</strong></div>
          <div class="card-body">
            @if (user(); as u) {
              <div class="mb-3">
                <label class="form-label text-muted">Name</label>
                <div class="form-control-plaintext fw-bold">{{ u.name || 'N/A' }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted">Email</label>
                <div class="form-control-plaintext">{{ u.email }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted">Role</label>
                <div><span class="badge bg-primary">{{ u.role }}</span></div>
              </div>
            } @else {
              <p class="text-muted">No user info available.</p>
            }
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header"><strong>Change Password</strong></div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Current Password</label>
              <input type="password" class="form-control" [(ngModel)]="currentPassword" placeholder="Enter current password" />
            </div>
            <div class="mb-3">
              <label class="form-label">New Password</label>
              <input type="password" class="form-control" [(ngModel)]="newPassword" placeholder="Enter new password" />
            </div>
            <div class="mb-3">
              <label class="form-label">Confirm New Password</label>
              <input type="password" class="form-control" [(ngModel)]="confirmPassword" placeholder="Confirm new password" />
            </div>
            @if (passwordError()) {
              <div class="alert alert-danger py-2">{{ passwordError() }}</div>
            }
            @if (passwordSuccess()) {
              <div class="alert alert-success py-2">{{ passwordSuccess() }}</div>
            }
            <button class="btn btn-primary" (click)="changePassword()" [disabled]="saving()">
              @if (saving()) { <span class="spinner-border spinner-border-sm me-1"></span> } Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-control-plaintext { padding-left: 0; }
  `]
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  user = this.authService.currentUser;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  saving = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');

  ngOnInit() {}

  changePassword() {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError.set('All fields are required.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('New password must be at least 6 characters.');
      return;
    }

    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/auth/change-password`, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    }).subscribe({
      next: () => {
        this.passwordSuccess.set('Password changed successfully.');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.saving.set(false);
      },
      error: (err) => {
        this.passwordError.set(err.error?.message || 'Failed to change password.');
        this.saving.set(false);
      },
    });
  }
}
