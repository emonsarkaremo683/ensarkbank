import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import {
  LoanResponse, LoanApplicationRequest, AccountResponse, LoanRepayment
} from '../../core/models';
import { LoanType, LoanStatus, Role } from '../../core/enums/role.enum';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    DataTableComponent, StatsCardComponent,
    LoadingComponent, ConfirmDialogComponent
  ],
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss']
})
export class LoansComponent implements OnInit {
  loans = signal<LoanResponse[]>([]);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  submitting = signal(false);

  showModal = signal(false);
  showDetailModal = signal(false);
  showRepayModal = signal(false);
  showConfirmDialog = signal(false);
  selectedLoan = signal<LoanResponse | null>(null);
  repayments = signal<LoanRepayment[]>([]);
  confirmAction = signal<'approve' | 'reject' | 'disburse' | null>(null);

  form = {
    accountId: 0,
    principalAmount: 0,
    annualInterestRate: 0,
    tenureMonths: 0
  };

  repayAmount = 0;

  columns: TableColumn[] = [
    { key: 'loanId', label: 'Loan ID', sortable: true },
    { key: 'accountNumber', label: 'Account', sortable: true },
    { key: 'principalAmount', label: 'Principal', type: 'currency', sortable: true },
    { key: 'emiAmount', label: 'EMI', type: 'currency', sortable: true },
    { key: 'outstandingBalance', label: 'Outstanding', type: 'currency', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'applicationDate', label: 'Applied', type: 'date', sortable: true },
  ];

  loanTypes = Object.values(LoanType);

  filteredLoans = computed(() => this.loans());

  totalLoans = computed(() => this.loans().length);
  pendingLoans = computed(() => this.loans().filter(l => l.status === 'PENDING').length);
  activeLoans = computed(() => this.loans().filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED').length);
  totalDisbursed = computed(() =>
    this.loans()
      .filter(l => l.status === 'DISBURSED' || l.status === 'ACTIVE')
      .reduce((s, l) => s + l.principalAmount, 0)
  );

  isManager = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER])
  );
  isLoanOfficer = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.LOAN_OFFICER, Role.BRANCH_MANAGER])
  );
  isAccountant = computed(() =>
    this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.BRANCH_MANAGER])
  );

  Math = Math;

  constructor(
    private api: ApiService,
    private notify: NotificationService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    if (this.auth.isCustomer()) {
      const userId = this.auth.currentUser()!.id;
      this.api.getAccountsByCustomerId(userId).subscribe({
        next: accounts => {
          this.accounts.set(accounts);
          if (accounts.length === 0) {
            this.loans.set([]);
            this.loading.set(false);
            return;
          }
          forkJoin(
            accounts.map(acc =>
              this.api.getLoansByAccount(acc.id).pipe(catchError(() => of([])))
            )
          ).subscribe({
            next: results => {
              this.loans.set(results.flat());
              this.loading.set(false);
            },
            error: () => {
              this.notify.error('Error', 'Failed to load loans');
              this.loading.set(false);
            }
          });
        },
        error: () => {
          this.notify.error('Error', 'Failed to load accounts');
          this.loading.set(false);
        }
      });
    } else {
      this.api.getLoans().subscribe({
        next: data => { this.loans.set(data); this.loading.set(false); },
        error: () => { this.notify.error('Error', 'Failed to load loans'); this.loading.set(false); }
      });
      this.api.getAccounts().subscribe({
        next: data => this.accounts.set(data),
        error: () => {}
      });
    }
  }

  openApply(): void {
    this.form = { accountId: 0, principalAmount: 0, annualInterestRate: 8.5, tenureMonths: 12 };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitLoan(): void {
    if (!this.form.accountId || this.form.principalAmount <= 0 || this.form.annualInterestRate <= 0 || this.form.tenureMonths <= 0) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    this.submitting.set(true);
    const request: LoanApplicationRequest = {
      accountId: this.form.accountId,
      principalAmount: this.form.principalAmount,
      annualInterestRate: this.form.annualInterestRate,
      tenureMonths: this.form.tenureMonths
    };
    this.api.applyLoan(request).subscribe({
      next: (res) => {
        this.notify.success('Success', 'Loan application submitted');
        this.loans.update(list => [res, ...list]);
        this.closeModal();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to apply loan');
        this.submitting.set(false);
      }
    });
  }

  viewDetail(loan: LoanResponse): void {
    this.selectedLoan.set(loan);
    this.showDetailModal.set(true);
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedLoan.set(null);
  }

  openRepay(loan: LoanResponse): void {
    this.selectedLoan.set(loan);
    this.repayments.set([]);
    this.showRepayModal.set(true);
    this.api.getLoanRepayments(loan.loanId).subscribe({
      next: (data) => this.repayments.set(data),
      error: () => this.notify.error('Error', 'Failed to load repayment schedule')
    });
  }

  closeRepay(): void {
    this.showRepayModal.set(false);
    this.selectedLoan.set(null);
    this.repayments.set([]);
    this.repayAmount = 0;
  }

  payRepayment(repayment: LoanRepayment): void {
    if (!repayment || repayment.status === 'PAID' || repayment.status === 'LATE') return;
    this.submitting.set(true);
    this.api.payInstallment(repayment.id).subscribe({
      next: () => {
        this.notify.success('Success', `Installment #${repayment.installmentNumber} paid successfully`);
        this.loadData();
        this.openRepay(this.selectedLoan()!);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Payment failed');
        this.submitting.set(false);
      }
    });
  }

  getRepaymentStatusClass(status: string): string {
    const map: Record<string, string> = {
      'PAID': 'badge-success',
      'PENDING': 'badge-warning',
      'LATE': 'badge-danger'
    };
    return map[status] || 'badge-neutral';
  }

  confirmLoanAction(loan: LoanResponse, action: 'approve' | 'reject' | 'disburse'): void {
    this.selectedLoan.set(loan);
    this.confirmAction.set(action);
    this.showConfirmDialog.set(true);
  }

  executeLoanAction(): void {
    const loan = this.selectedLoan();
    const action = this.confirmAction();
    if (!loan || !action) return;

    this.submitting.set(true);
    let obs;
    if (action === 'approve') obs = this.api.approveLoan(loan.loanId);
    else if (action === 'reject') obs = this.api.rejectLoan(loan.loanId);
    else obs = this.api.disburseLoan(loan.loanId);

    obs.subscribe({
      next: (res) => {
        const labels: Record<string, string> = { approve: 'approved', reject: 'rejected', disburse: 'disbursed' };
        this.notify.success('Success', `Loan ${labels[action!]} successfully`);
        this.loans.update(list => list.map(l => l.loanId === res.loanId ? res : l));
        this.showConfirmDialog.set(false);
        this.submitting.set(false);
      },
      error: (err) => {
        this.notify.error('Error', err.error?.message || `Failed to ${action} loan`);
        this.showConfirmDialog.set(false);
        this.submitting.set(false);
      }
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'badge-warning', 'APPROVED': 'badge-success',
      'REJECTED': 'badge-danger', 'DISBURSED': 'badge-info',
      'ACTIVE': 'badge-info', 'CLOSED': 'badge-neutral',
      'OVERDUE': 'badge-danger', 'DEFAULTED': 'badge-danger'
    };
    return map[status] || 'badge-neutral';
  }

  getConfirmTitle(): string {
    const action = this.confirmAction();
    if (action === 'approve') return 'Approve Loan';
    if (action === 'reject') return 'Reject Loan';
    return 'Disburse Loan';
  }

  getConfirmMessage(): string {
    const loan = this.selectedLoan();
    const action = this.confirmAction();
    if (!loan) return '';
    if (action === 'approve') return `Approve loan #${loan.loanId} for ${this.formatCurrency(loan.principalAmount)}?`;
    if (action === 'reject') return `Reject loan #${loan.loanId}? This cannot be undone.`;
    return `Disburse ${this.formatCurrency(loan.principalAmount)} for loan #${loan.loanId}? Amount will be credited to account ${loan.accountNumber}.`;
  }
}
