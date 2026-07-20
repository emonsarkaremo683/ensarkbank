import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.status.set('error');
        this.message.set('No verification token provided. Please check your email link.');
        return;
      }

      this.authService.verifyEmail(token).subscribe({
        next: (res) => {
          this.status.set('success');
          this.message.set(res || 'Email verified successfully!');
        },
        error: (err) => {
          this.status.set('error');
          this.message.set(err.error || 'Verification failed. The link may have expired or already been used.');
        }
      });
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
