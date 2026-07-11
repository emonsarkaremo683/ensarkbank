import { Role } from './role';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: Role[];
}

export const MENU_ITEMS: MenuItem[] = [
  { icon: 'grid', label: 'Dashboard', route: '/dashboard', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.LOAN_OFFICER, Role.CUSTOMER_SERVICE, Role.ATM_MANAGER, Role.AUDITOR, Role.CUSTOMER] },
  { icon: 'users', label: 'Customers', route: '/customers', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE, Role.CASHIER, Role.AUDITOR] },
  { icon: 'wallet', label: 'Accounts', route: '/accounts', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE, Role.LOAN_OFFICER, Role.AUDITOR, Role.CUSTOMER] },
  { icon: 'arrow-left-right', label: 'Transactions', route: '/transactions', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE, Role.AUDITOR, Role.CUSTOMER] },
  { icon: 'credit-card', label: 'Cards', route: '/cards', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE, Role.AUDITOR, Role.CUSTOMER] },
  { icon: 'landmark', label: 'Loans', route: '/loans', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.LOAN_OFFICER, Role.ACCOUNTANT, Role.AUDITOR, Role.CUSTOMER] },
  { icon: 'receipt', label: 'Cashier', route: '/cashier', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER] },
  { icon: 'briefcase', label: 'Employees', route: '/employees', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER] },
  { icon: 'building-2', label: 'Branches', route: '/branches', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE, Role.LOAN_OFFICER, Role.ATM_MANAGER, Role.AUDITOR] },
  { icon: 'smartphone', label: 'ATMs', route: '/atms', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER, Role.BRANCH_MANAGER] },
  { icon: 'book-open', label: 'Accounting', route: '/accounting', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.AUDITOR] },
  { icon: 'bar-chart-3', label: 'Reports', route: '/reports', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.AUDITOR] },
  { icon: 'user-plus', label: 'Beneficiaries', route: '/beneficiaries', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE, Role.CUSTOMER] },
];
