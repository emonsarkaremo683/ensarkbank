import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services';
import { LoanApplicationResponse } from '../../models';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.scss'
})
export class LoanDetail implements OnInit {
  private loanService = inject(LoanService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loan = signal<LoanApplicationResponse | null>(null);
  loading = signal(true);
  error = signal('');
  success = signal('');
  rejectReason = signal('');
  showRejectModal = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLoan(+id);
    }
  }

  loadLoan(id: number) {
    this.loading.set(true);
    this.loanService.getById(id).subscribe({
      next: (data) => { this.loan.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  approve() {
    const id = this.loan()?.loanId;
    if (!id) return;
    this.loanService.approve(id).subscribe({
      next: (data) => { this.loan.set(data); this.success.set('Loan approved successfully!'); },
      error: (err) => { this.error.set(err.message); }
    });
  }

  openRejectModal() {
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal() {
    this.showRejectModal.set(false);
  }

  reject() {
    const id = this.loan()?.loanId;
    if (!id || !this.rejectReason()) return;
    this.loanService.reject(id, this.rejectReason()).subscribe({
      next: (data) => { this.loan.set(data); this.showRejectModal.set(false); this.success.set('Loan rejected.'); },
      error: (err) => { this.error.set(err.message); this.showRejectModal.set(false); }
    });
  }

  disburse() {
    const id = this.loan()?.loanId;
    if (!id) return;
    this.loanService.disburse(id).subscribe({
      next: (data) => { this.loan.set(data); this.success.set('Loan disbursed successfully!'); },
      error: (err) => { this.error.set(err.message); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-yellow';
      case 'APPROVED': return 'badge-blue';
      case 'REJECTED': return 'badge-red';
      case 'DISBURSED':
      case 'ACTIVE': return 'badge-green';
      case 'CLOSED': return 'badge-light';
      case 'OVERDUE':
      case 'DEFAULTED': return 'badge-red';
      default: return 'badge-light';
    }
  }
}
