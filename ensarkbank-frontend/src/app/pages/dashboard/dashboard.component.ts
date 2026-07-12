import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subject, takeUntil, forkJoin, catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/enums/role.enum';
import { LoadingComponent } from '../../shared';
import { StatsCardComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingComponent, StatsCardComponent, DataTableComponent],
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

  recentTransactions = signal<any[]>([]);

  transactionColumns: TableColumn[] = [
    { key: 'transactionId', label: 'Transaction ID', type: 'text', sortable: true },
    { key: 'type', label: 'Type', type: 'status', sortable: true },
    { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
    { key: 'channel', label: 'Channel', type: 'badge', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'createdAt', label: 'Date', type: 'date', sortable: true }
  ];

  currentUser = computed(() => this.auth.currentUser());
  isSuperAdmin = computed(() => this.auth.hasRole([Role.SUPER_ADMIN]));
  isAdmin = computed(() => this.auth.hasRole([Role.SUPER_ADMIN, Role.ADMIN]));
  isBranchManager = computed(() => this.auth.hasRole([Role.BRANCH_MANAGER]));

  quickActions = computed(() => {
    const actions = [
      { label: 'New Transaction', icon: '⚡', route: '/transactions/new', color: '#c9a84c', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER] },
      { label: 'Manage Accounts', icon: '🏦', route: '/accounts', color: '#3b82f6', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER] },
      { label: 'Customers', icon: '👥', route: '/customers', color: '#22c55e', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE] },
      { label: 'View Reports', icon: '📊', route: '/reports', color: '#f59e0b', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.AUDITOR] },
      { label: 'Loan Applications', icon: '📋', route: '/loans', color: '#8b5cf6', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.LOAN_OFFICER] },
      { label: 'Manage Employees', icon: '👤', route: '/employees', color: '#ec4899', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
      { label: 'Manage Branches', icon: '🏛️', route: '/branches', color: '#14b8a6', roles: [Role.SUPER_ADMIN] },
      { label: 'ATM Management', icon: '🏧', route: '/atm', color: '#f97316', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER] },
      { label: 'Cards', icon: '💳', route: '/cards', color: '#06b6d4', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER] },
      { label: 'Transactions', icon: '📝', route: '/transactions', color: '#a855f7', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.ACCOUNTANT] },
      { label: 'Beneficiaries', icon: '🤝', route: '/beneficiaries', color: '#22d3ee', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CUSTOMER_SERVICE] },
      { label: 'Cashier Operations', icon: '💰', route: '/transactions/cashier', color: '#eab308', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CASHIER] }
    ];
    const userRole = this.currentUser()?.role as Role;
    return actions.filter(a => a.roles.includes(userRole));
  });

  visibleStats = computed(() => {
    const userRole = this.currentUser()?.role as Role;
    if (userRole === Role.SUPER_ADMIN || userRole === Role.ADMIN) {
      return ['customers', 'accounts', 'transactions', 'loans', 'balance', 'atms'];
    }
    if (userRole === Role.BRANCH_MANAGER) {
      return ['customers', 'accounts', 'transactions', 'balance'];
    }
    if (userRole === Role.ACCOUNTANT || userRole === Role.AUDITOR) {
      return ['transactions', 'balance'];
    }
    if (userRole === Role.LOAN_OFFICER) {
      return ['loans', 'transactions'];
    }
    if (userRole === Role.CASHIER) {
      return ['transactions', 'balance'];
    }
    if (userRole === Role.ATM_MANAGER) {
      return ['atms'];
    }
    return ['transactions'];
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
    const userRole = this.currentUser()?.role as Role;
    const isCustomer = userRole === Role.CUSTOMER;

    if (isCustomer) {
      forkJoin({
        accounts: this.api.getAccounts().pipe(catchError(() => of([]))),
        transactions: this.api.getTransactions().pipe(catchError(() => of([]))),
        loans: this.api.getLoans().pipe(catchError(() => of([])))
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.accountCount.set(data.accounts.length);
          this.transactionCount.set(data.transactions.length);
          this.loanCount.set(data.loans.length);
          this.totalBalance.set(data.accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0));
          this.recentTransactions.set(data.transactions.slice(0, 10));
          this.lastRefresh.set(new Date());
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      forkJoin({
        customers: this.api.getCustomers().pipe(catchError(() => of([]))),
        accounts: this.api.getAccounts().pipe(catchError(() => of([]))),
        transactions: this.api.getTransactions().pipe(catchError(() => of([]))),
        loans: this.api.getLoans().pipe(catchError(() => of([]))),
        atms: this.api.getATMs().pipe(catchError(() => of([])))
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.customerCount.set(data.customers.length);
          this.accountCount.set(data.accounts.length);
          this.transactionCount.set(data.transactions.length);
          this.loanCount.set(data.loans.length);
          this.totalBalance.set(data.accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0));
          this.atmCount.set(data.atms.length);
          this.recentTransactions.set(data.transactions.slice(0, 10));
          this.lastRefresh.set(new Date());
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
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

  onTransactionAction(row: any): void {
    this.router.navigate(['/transactions', row.transactionId]);
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
