import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-verify-email-sent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email-sent.component.html',
  styleUrls: ['./verify-email-sent.component.scss']
})
export class VerifyEmailSentComponent implements OnInit {
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);

  email = signal('');
  isResending = signal(false);
  resent = signal(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
      }
    });
  }

  resendEmail(): void {
    if (!this.email()) return;
    this.isResending.set(true);
    this.authService.sendVerificationEmail(this.email()).subscribe({
      next: () => {
        this.isResending.set(false);
        this.resent.set(true);
        this.notification.success('Email Sent', 'Verification email has been resent.');
      },
      error: (err) => {
        this.isResending.set(false);
        const message = err.error || 'Failed to resend email. Please try again.';
        this.notification.error('Error', message);
      }
    });
  }
}
