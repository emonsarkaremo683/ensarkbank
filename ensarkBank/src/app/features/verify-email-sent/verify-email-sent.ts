import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email-sent',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './verify-email-sent.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './verify-email-sent.scss',
})
export class VerifyEmailSent {
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  resendEmail = signal('');
  sending = signal(false);

  resend(email: string) {
    if (!email) {
      this.toast.warning('Please enter your email address');
      return;
    }
    this.sending.set(true);
    this.authService.sendVerificationEmail(email).subscribe({
      next: () => {
        this.sending.set(false);
        this.toast.success('Verification email sent again');
      },
      error: (err) => {
        this.sending.set(false);
        this.toast.error(err.error?.message || err.message || 'Failed to resend');
      },
    });
  }
}
