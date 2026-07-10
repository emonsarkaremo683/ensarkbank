import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LoanService } from '../../services';
import { AccountService } from '../../services';
import { LoanApplicationRequest, AccountResponse } from '../../models';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './loan-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loan-form.scss',
})
export class LoanForm implements OnInit {
  private loanService = inject(LoanService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  loan: LoanApplicationRequest = {
    accountId: 0,
    principalAmount: 0,
    annualInterestRate: 0,
    tenureMonths: 0,
  };

  accounts = signal<AccountResponse[]>([]);
  loading = signal(false);
  error = signal('');
  calculatedEmi = signal<number>(0);
  calculatedTotal = signal<number>(0);

  ngOnInit() {
    this.accountService.getAll().subscribe({ next: (data) => this.accounts.set(data) });
  }

  calculateEMI() {
    const p = this.loan.principalAmount;
    const r = this.loan.annualInterestRate / 100 / 12;
    const n = this.loan.tenureMonths;
    if (p > 0 && n > 0) {
      if (r === 0) {
        this.calculatedEmi.set(p / n);
        this.calculatedTotal.set(p);
      } else {
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        this.calculatedEmi.set(emi);
        this.calculatedTotal.set(emi * n);
      }
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.loanService.apply(this.loan).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/loans']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
