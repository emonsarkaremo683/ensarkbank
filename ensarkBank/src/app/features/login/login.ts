import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = signal('');
  password = signal('');
  loading = signal(false);

  onSubmit() {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      this.toast.warning('Please enter email and password');
      return;
    }

    this.loading.set(true);
    this.auth.login({ email, password }).subscribe({
      next: () => {
        this.toast.success('Login successful');
        const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] as string | undefined;
        this.router.navigateByUrl(returnUrl || '/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message || err.message || 'Login failed');
      },
    });
  }
}
