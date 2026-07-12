import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/enums/role.enum';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./public/pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./public/pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./public/pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./public/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./public/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./public/pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Staff routes (all authenticated non-CUSTOMER users)
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.LOAN_OFFICER, Role.CUSTOMER_SERVICE, Role.ATM_MANAGER, Role.AUDITOR])]
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER])]
      },
      {
        path: 'branches',
        loadComponent: () => import('./pages/branches/branches.component').then(m => m.BranchesComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER])]
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE])]
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE])]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER])]
      },
      {
        path: 'loans',
        loadComponent: () => import('./pages/loans/loans.component').then(m => m.LoansComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.LOAN_OFFICER, Role.ACCOUNTANT])]
      },
      {
        path: 'cards',
        loadComponent: () => import('./pages/cards/cards.component').then(m => m.CardsComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.CUSTOMER_SERVICE])]
      },
      {
        path: 'atm',
        loadComponent: () => import('./pages/atm/atm.component').then(m => m.AtmComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER, Role.BRANCH_MANAGER])]
      },
      {
        path: 'kyc',
        loadComponent: () => import('./pages/kyc/kyc.component').then(m => m.KycComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE])]
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.AUDITOR])]
      },
      {
        path: 'beneficiaries',
        loadComponent: () => import('./pages/beneficiaries/beneficiaries.component').then(m => m.BeneficiariesComponent),
        canActivate: [roleGuard([Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.CUSTOMER_SERVICE])]
      }
    ]
  },

  // Customer routes
  {
    path: 'customer',
    loadComponent: () => import('./layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      },
      {
        path: 'cards',
        loadComponent: () => import('./pages/cards/cards.component').then(m => m.CardsComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      },
      {
        path: 'loans',
        loadComponent: () => import('./pages/loans/loans.component').then(m => m.LoansComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      },
      {
        path: 'beneficiaries',
        loadComponent: () => import('./pages/beneficiaries/beneficiaries.component').then(m => m.BeneficiariesComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      },
      {
        path: 'kyc',
        loadComponent: () => import('./pages/customer-kyc/customer-kyc.component').then(m => m.CustomerKycComponent),
        canActivate: [roleGuard([Role.CUSTOMER])]
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
