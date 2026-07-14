import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/enums/role.enum';
import { AccountResponse, LoanResponse, DashboardStats } from '../../core/models';
import { LoadingComponent } from '../../shared';
import { StatsCardComponent } from '../../shared';
import { ChartComponent } from '../../shared/components/charts/chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingComponent, StatsCardComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = signal(true);
  autoRefresh = signal(false);
  lastRefresh = signal<Date>(new Date());

  customerCount = signal(0);
  accountCount = signal(0);
  transactionCount = signal(0);
  loanCount = signal(0);
  totalBalance = signal(0);
  atmCount = signal(0);

  customerAccounts = signal<AccountResponse[]>([]);
  customerLoans = signal<LoanResponse[]>([]);

  dashboardStats = signal<DashboardStats | null>(null);

  currentUser = computed(() => this.auth.currentUser());
  isCustomer = computed(() => this.auth.isCustomer());
  isSuperAdmin = computed(() => this.auth.hasRole([Role.SUPER_ADMIN]));
  isAdmin = computed(() => this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN]));
  isBranchManager = computed(() => this.auth.hasRole([Role.BRANCH_MANAGER]));
  isAuditor = computed(() => this.auth.hasRole([Role.AUDITOR]));
  canSeeBranchWise = computed(() => this.isAdmin() || this.isAuditor());

  transactionTrendLabels = signal<string[]>([]);
  transactionTrendData = signal<number[]>([]);
  accountTypeLabels = signal<string[]>([]);
  accountTypeData = signal<number[]>([]);
  loanStatusLabels = signal<string[]>([]);
  loanStatusData = signal<number[]>([]);
  transactionTypeLabels = signal<string[]>([]);
  transactionTypeData = signal<number[]>([]);
  branchLabels = signal<string[]>([]);
  branchAccountData = signal<number[]>([]);
  branchBalanceData = signal<number[]>([]);

  quickActions = computed(() => {
    const userRole = this.currentUser()?.role as Role;
    if (this.auth.isCustomer()) {
      return [
        { label: 'My Accounts', icon: '🏦', route: '/customer/accounts', color: '#3b82f6' },
        { label: 'My Transactions', icon: '📝', route: '/customer/transactions', color: '#c9a84c' },
        { label: 'My Cards', icon: '💳', route: '/customer/cards', color: '#06b6d4' },
        { label: 'My Loans', icon: '💰', route: '/customer/loans', color: '#8b5cf6' },
        { label: 'My Beneficiaries', icon: '🤝', route: '/customer/beneficiaries', color: '#22d3ee' },
        { label: 'My KYC', icon: '📋', route: '/customer/kyc', color: '#f59e0b' }
      ];
    }
    const actions = [
      { label: 'Dashboard', icon: '📊', route: '/dashboard', color: '#64748b', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.AUDITOR, Role.CASHIER, Role.LOAN_OFFICER, Role.CUSTOMER_SERVICE, Role.ATM_MANAGER] },
      { label: 'New Transaction', icon: '⚡', route: '/transactions/new', color: '#c9a84c', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER] },
      { label: 'Manage Accounts', icon: '🏦', route: '/accounts', color: '#3b82f6', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT] },
      { label: 'Customers', icon: '👥', route: '/customers', color: '#22c55e', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE, Role.AUDITOR] },
      { label: 'Transactions', icon: '📝', route: '/transactions', color: '#a855f7', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.ACCOUNTANT, Role.AUDITOR, Role.CUSTOMER_SERVICE, Role.LOAN_OFFICER] },
      { label: 'Loan Applications', icon: '📋', route: '/loans', color: '#8b5cf6', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.LOAN_OFFICER] },
      { label: 'Cards', icon: '💳', route: '/cards', color: '#06b6d4', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER, Role.BRANCH_MANAGER] },
      { label: 'ATM Management', icon: '🏧', route: '/atm', color: '#f97316', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER] },
      { label: 'View Reports', icon: '📈', route: '/reports', color: '#f59e0b', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.AUDITOR] },
      { label: 'Manage Employees', icon: '👤', route: '/employees', color: '#ec4899', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
      { label: 'Manage Branches', icon: '🏛️', route: '/branches', color: '#14b8a6', roles: [Role.SUPER_ADMIN] },
      { label: 'Beneficiaries', icon: '🤝', route: '/beneficiaries', color: '#22d3ee', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CUSTOMER_SERVICE, Role.BRANCH_MANAGER] },
      { label: 'Cashier Operations', icon: '💰', route: '/transactions/cashier', color: '#eab308', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER] }
    ];
    return actions.filter(a => a.roles.includes(userRole));
  });

  visibleStats = computed(() => {
    if (this.auth.isCustomer()) {
      return ['accounts', 'transactions', 'loans', 'balance'];
    }
    const userRole = this.currentUser()?.role as Role;
    switch (userRole) {
      case Role.SUPER_ADMIN:
      case Role.ADMIN:
        return ['customers', 'accounts', 'transactions', 'loans', 'balance', 'atms'];
      case Role.BRANCH_MANAGER:
        return ['customers', 'accounts', 'transactions', 'loans', 'balance'];
      case Role.ACCOUNTANT:
      case Role.AUDITOR:
        return ['customers', 'accounts', 'transactions', 'balance'];
      case Role.LOAN_OFFICER:
        return ['loans', 'transactions', 'balance'];
      case Role.CASHIER:
        return ['transactions', 'balance', 'accounts'];
      case Role.CUSTOMER_SERVICE:
        return ['customers', 'accounts', 'transactions'];
      case Role.ATM_MANAGER:
        return ['atms', 'transactions', 'balance'];
      default:
        return ['transactions'];
    }
  });

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    if (this.auth.isCustomer()) {
      this.loadCustomerData();
    } else {
      this.loadStaffData();
    }
  }

  private loadCustomerData(): void {
    const customerId = this.currentUser()?.id ?? 0;
    this.api.getAccountsByCustomerId(customerId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (accounts) => {
        this.customerAccounts.set(accounts);
        this.accountCount.set(accounts.length);
        this.totalBalance.set(accounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDate = thirtyDaysAgo.toISOString();
        const endDate = new Date().toISOString();

        this.api.getTransactionHistory(customerId, startDate, endDate).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (journals) => {
            this.transactionCount.set(journals.length);
            this.lastRefresh.set(new Date());
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Dashboard: Failed to load transaction history', err);
            this.loading.set(false);
          }
        });

        const loanObservables = accounts.map(a =>
          this.api.getLoansByAccount(a.id).pipe(catchError(() => of([] as LoanResponse[])))
        );
        forkJoin(loanObservables).pipe(takeUntil(this.destroy$)).subscribe({
          next: (results) => {
            const allLoans = results.flat();
            this.customerLoans.set(allLoans);
            this.loanCount.set(allLoans.length);
          }
        });
      },
      error: () => this.loading.set(false)
    });
  }

  private loadStaffData(): void {
    this.api.getDashboardStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (stats) => {
        this.dashboardStats.set(stats);
        this.customerCount.set(stats.totalCustomers);
        this.accountCount.set(stats.totalAccounts);
        this.transactionCount.set(stats.totalTransactions);
        this.loanCount.set(stats.totalLoans);
        this.totalBalance.set(stats.totalBalance);
        this.atmCount.set(stats.totalActiveCards);

        this.transactionTrendLabels.set(stats.transactionTrends.map((t: any) => t.date));
        this.transactionTrendData.set(stats.transactionTrends.map((t: any) => t.count));

        this.accountTypeLabels.set(stats.accountTypeDistribution.map((a: any) => a.label));
        this.accountTypeData.set(stats.accountTypeDistribution.map((a: any) => a.value));

        this.loanStatusLabels.set(stats.loanStatusDistribution.map((l: any) => l.label));
        this.loanStatusData.set(stats.loanStatusDistribution.map((l: any) => l.value));

        this.transactionTypeLabels.set(stats.transactionTypeDistribution.map((t: any) => t.label));
        this.transactionTypeData.set(stats.transactionTypeDistribution.map((t: any) => t.value));

        if (stats.branchWiseSummary && stats.branchWiseSummary.length > 0) {
          this.branchLabels.set(stats.branchWiseSummary.map((b: any) => b.branchName));
          this.branchAccountData.set(stats.branchWiseSummary.map((b: any) => b.accountCount));
          this.branchBalanceData.set(stats.branchWiseSummary.map((b: any) => b.totalBalance));
        }

        this.lastRefresh.set(new Date());
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Error', 'Failed to load dashboard data');
      }
    });
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update(v => !v);
    if (this.autoRefresh()) {
      interval(30000).pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.autoRefresh()) {
          this.loadDashboardData();
        }
      });
    }
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
