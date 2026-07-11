import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role } from '../../../core/enums/role.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = signal(false);
  showPassword = signal(false);
  rememberMe = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (this.authService.isLoggedIn()) {
      this.redirectByRole();
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.notification.success('Welcome Back', `Logged in as ${response.user.name}`);
        this.redirectByRole();
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || err.error?.error || 'Invalid email or password. Please try again.';
        this.notification.error('Login Failed', message);
      }
    });
  }

  private redirectByRole(): void {
    const user = this.authService.currentUser();
    if (user?.role === Role.CUSTOMER) {
      this.router.navigate(['/customer/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
