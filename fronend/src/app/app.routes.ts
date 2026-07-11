import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Customers
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list.component').then(
            (m) => m.CustomerListComponent
          ),
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./features/customers/customer-form.component').then(
            (m) => m.CustomerFormComponent
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail.component').then(
            (m) => m.CustomerDetailComponent
          ),
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () =>
          import('./features/customers/customer-form.component').then(
            (m) => m.CustomerFormComponent
          ),
      },
      // Accounts
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/account-list.component').then(
            (m) => m.AccountListComponent
          ),
      },
      {
        path: 'accounts/new',
        loadComponent: () =>
          import('./features/accounts/account-form.component').then(
            (m) => m.AccountFormComponent
          ),
      },
      {
        path: 'accounts/:accountNumber',
        loadComponent: () =>
          import('./features/accounts/account-detail.component').then(
            (m) => m.AccountDetailComponent
          ),
      },
      // Transactions
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list.component').then(
            (m) => m.TransactionListComponent
          ),
      },
      {
        path: 'transactions/new',
        loadComponent: () =>
          import('./features/transactions/transaction-form.component').then(
            (m) => m.TransactionFormComponent
          ),
      },
      {
        path: 'transactions/:id',
        loadComponent: () =>
          import('./features/transactions/transaction-detail.component').then(
            (m) => m.TransactionDetailComponent
          ),
      },
      // Cards
      {
        path: 'cards',
        loadComponent: () =>
          import('./features/cards/card-list.component').then((m) => m.CardListComponent),
      },
      {
        path: 'cards/new',
        loadComponent: () =>
          import('./features/cards/card-form.component').then((m) => m.CardFormComponent),
      },
      {
        path: 'cards/:id',
        loadComponent: () =>
          import('./features/cards/card-detail.component').then((m) => m.CardDetailComponent),
      },
      // Loans
      {
        path: 'loans',
        loadComponent: () =>
          import('./features/loans/loan-list.component').then((m) => m.LoanListComponent),
      },
      {
        path: 'loans/apply',
        loadComponent: () =>
          import('./features/loans/loan-form.component').then((m) => m.LoanFormComponent),
      },
      {
        path: 'loans/:id',
        loadComponent: () =>
          import('./features/loans/loan-detail.component').then((m) => m.LoanDetailComponent),
      },
      // Cashier
      {
        path: 'cashier',
        loadComponent: () =>
          import('./features/cashier/cashier.component').then((m) => m.CashierComponent),
      },
      {
        path: 'cashier/new',
        loadComponent: () =>
          import('./features/cashier/cashier-transaction.component').then(
            (m) => m.CashierTransactionComponent
          ),
      },
      // Employees
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employee-list.component').then(
            (m) => m.EmployeeListComponent
          ),
      },
      {
        path: 'employees/new',
        loadComponent: () =>
          import('./features/employees/employee-form.component').then(
            (m) => m.EmployeeFormComponent
          ),
      },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/employees/employee-detail.component').then(
            (m) => m.EmployeeDetailComponent
          ),
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () =>
          import('./features/employees/employee-form.component').then(
            (m) => m.EmployeeFormComponent
          ),
      },
      // Branches
      {
        path: 'branches',
        loadComponent: () =>
          import('./features/branches/branch-list.component').then(
            (m) => m.BranchListComponent
          ),
      },
      {
        path: 'branches/new',
        loadComponent: () =>
          import('./features/branches/branch-form.component').then(
            (m) => m.BranchFormComponent
          ),
      },
      {
        path: 'branches/:id',
        loadComponent: () =>
          import('./features/branches/branch-detail.component').then(
            (m) => m.BranchDetailComponent
          ),
      },
      {
        path: 'branches/:id/edit',
        loadComponent: () =>
          import('./features/branches/branch-form.component').then(
            (m) => m.BranchFormComponent
          ),
      },
      // ATMs
      {
        path: 'atms',
        loadComponent: () =>
          import('./features/atms/atm-list.component').then((m) => m.AtmListComponent),
      },
      {
        path: 'atms/new',
        loadComponent: () =>
          import('./features/atms/atm-form.component').then((m) => m.AtmFormComponent),
      },
      {
        path: 'atms/:id',
        loadComponent: () =>
          import('./features/atms/atm-detail.component').then((m) => m.AtmDetailComponent),
      },
      // Beneficiaries
      {
        path: 'beneficiaries',
        loadComponent: () =>
          import('./features/beneficiaries/beneficiary-list.component').then(
            (m) => m.BeneficiaryListComponent
          ),
      },
      {
        path: 'beneficiaries/new',
        loadComponent: () =>
          import('./features/beneficiaries/beneficiary-form.component').then(
            (m) => m.BeneficiaryFormComponent
          ),
      },
      {
        path: 'beneficiaries/:id',
        loadComponent: () =>
          import('./features/beneficiaries/beneficiary-detail.component').then(
            (m) => m.BeneficiaryDetailComponent
          ),
      },
      // Accounting
      {
        path: 'accounting',
        loadComponent: () =>
          import('./features/accounting/accounting.component').then(
            (m) => m.AccountingComponent
          ),
      },
      {
        path: 'accounting/journal',
        loadComponent: () =>
          import('./features/accounting/journal.component').then((m) => m.JournalComponent),
      },
      {
        path: 'accounting/ledger',
        loadComponent: () =>
          import('./features/accounting/ledger.component').then((m) => m.LedgerComponent),
      },
      {
        path: 'accounting/trial-balance',
        loadComponent: () =>
          import('./features/accounting/trial-balance.component').then(
            (m) => m.TrialBalanceComponent
          ),
      },
      {
        path: 'accounting/balance-sheet',
        loadComponent: () =>
          import('./features/accounting/balance-sheet.component').then(
            (m) => m.BalanceSheetComponent
          ),
      },
      // Reports
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'reports/accounts',
        loadComponent: () =>
          import('./features/reports/report-accounts.component').then(
            (m) => m.ReportAccountsComponent
          ),
      },
      {
        path: 'reports/daily',
        loadComponent: () =>
          import('./features/reports/report-daily.component').then(
            (m) => m.ReportDailyComponent
          ),
      },
      // Settings
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
