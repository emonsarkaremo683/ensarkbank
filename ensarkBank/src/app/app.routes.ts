import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { AccountList } from './features/accounts/account-list';
import { AccountForm } from './features/accounts/account-form';
import { AccountDetail } from './features/accounts/account-detail';
import { BeneficiaryList } from './features/beneficiaries/beneficiary-list';
import { BeneficiaryForm } from './features/beneficiaries/beneficiary-form';
import { BranchList } from './features/branches/branch-list';
import { BranchForm } from './features/branches/branch-form';
import { CardList } from './features/cards/card-list';
import { CardForm } from './features/cards/card-form';
import { CustomerList } from './features/customers/customer-list';
import { CustomerForm } from './features/customers/customer-form';
import { CustomerDetail } from './features/customers/customer-detail';
import { EmployeeList } from './features/employees/employee-list';
import { EmployeeForm } from './features/employees/employee-form';
import { TransactionList } from './features/transactions/transaction-list';
import { TransactionForm } from './features/transactions/transaction-form';
import { TransactionDetail } from './features/transactions/transaction-detail';
import { DistrictList } from './features/districts/district-list';
import { DivisionList } from './features/divisions/division-list';
import { PoliceStationList } from './features/police-stations/police-station-list';
import { LoanList } from './features/loans/loan-list';
import { LoanForm } from './features/loans/loan-form';
import { LoanDetail } from './features/loans/loan-detail';
import { AtmList } from './features/atms/atm-list';
import { AtmForm } from './features/atms/atm-form';
import { AtmTransactionList } from './features/atm-transactions/atm-transaction-list';
import { AtmTransactionForm } from './features/atm-transactions/atm-transaction-form';
import { AtmTransactionDetail } from './features/atm-transactions/atm-transaction-detail';
import { CashierTransactionList } from './features/cashier-transactions/cashier-transaction-list';
import { CashierTransactionForm } from './features/cashier-transactions/cashier-transaction-form';
import { CashierTransactionDetail } from './features/cashier-transactions/cashier-transaction-detail';
import { Ledger } from './features/reports/ledger';
import { TrialBalance } from './features/reports/trial-balance';
import { BalanceSheet } from './features/reports/balance-sheet';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    data: { title: 'Dashboard' }
  },
  {
    path: 'accounts',
    component: AccountList,
    data: { title: 'Accounts' }
  },
  {
    path: 'accounts/new',
    component: AccountForm,
    data: { title: 'New Account' }
  },
  {
    path: 'accounts/:id',
    component: AccountDetail,
    data: { title: 'Account Details' }
  },
  {
    path: 'beneficiaries',
    component: BeneficiaryList,
    data: { title: 'Beneficiaries' }
  },
  {
    path: 'beneficiaries/new',
    component: BeneficiaryForm,
    data: { title: 'New Beneficiary' }
  },
  {
    path: 'branches',
    component: BranchList,
    data: { title: 'Branches' }
  },
  {
    path: 'branches/new',
    component: BranchForm,
    data: { title: 'New Branch' }
  },
  {
    path: 'cards',
    component: CardList,
    data: { title: 'Cards' }
  },
  {
    path: 'cards/new',
    component: CardForm,
    data: { title: 'New Card' }
  },
  {
    path: 'customers',
    component: CustomerList,
    data: { title: 'Customers' }
  },
  {
    path: 'customers/new',
    component: CustomerForm,
    data: { title: 'New Customer' }
  },
  {
    path: 'customers/:id',
    component: CustomerDetail,
    data: { title: 'Customer Details' }
  },
  {
    path: 'employees',
    component: EmployeeList,
    data: { title: 'Employees' }
  },
  {
    path: 'employees/new',
    component: EmployeeForm,
    data: { title: 'New Employee' }
  },
  {
    path: 'transactions',
    component: TransactionList,
    data: { title: 'Transactions' }
  },
  {
    path: 'transactions/new',
    component: TransactionForm,
    data: { title: 'New Transaction' }
  },
  {
    path: 'transactions/:id',
    component: TransactionDetail,
    data: { title: 'Transaction Details' }
  },
  {
    path: 'districts',
    component: DistrictList,
    data: { title: 'Districts' }
  },
  {
    path: 'divisions',
    component: DivisionList,
    data: { title: 'Divisions' }
  },
  {
    path: 'police-stations',
    component: PoliceStationList,
    data: { title: 'Police Stations' }
  },
  {
    path: 'loans',
    component: LoanList,
    data: { title: 'Loans' }
  },
  {
    path: 'loans/new',
    component: LoanForm,
    data: { title: 'Apply for Loan' }
  },
  {
    path: 'loans/:id',
    component: LoanDetail,
    data: { title: 'Loan Details' }
  },
  {
    path: 'atms',
    component: AtmList,
    data: { title: 'ATMs' }
  },
  {
    path: 'atms/new',
    component: AtmForm,
    data: { title: 'New ATM' }
  },
  {
    path: 'atms/:id',
    component: AtmForm,
    data: { title: 'Edit ATM' }
  },
  {
    path: 'atm-transactions',
    component: AtmTransactionList,
    data: { title: 'ATM Transactions' }
  },
  {
    path: 'atm-transactions/new',
    component: AtmTransactionForm,
    data: { title: 'New ATM Transaction' }
  },
  {
    path: 'atm-transactions/:id',
    component: AtmTransactionDetail,
    data: { title: 'ATM Transaction Receipt' }
  },
  {
    path: 'cashier-transactions',
    component: CashierTransactionList,
    data: { title: 'Cashier Transactions' }
  },
  {
    path: 'cashier-transactions/new',
    component: CashierTransactionForm,
    data: { title: 'New Cashier Transaction' }
  },
  {
    path: 'cashier-transactions/:id',
    component: CashierTransactionDetail,
    data: { title: 'Cashier Transaction Details' }
  },
  {
    path: 'reports/ledger',
    component: Ledger,
    data: { title: 'Ledger' }
  },
  {
    path: 'reports/trial-balance',
    component: TrialBalance,
    data: { title: 'Trial Balance' }
  },
  {
    path: 'reports/balance-sheet',
    component: BalanceSheet,
    data: { title: 'Balance Sheet' }
  }
];
