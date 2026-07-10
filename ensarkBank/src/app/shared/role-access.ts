import { Role } from '../models/enums';

const ALL_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'ACCOUNTANT', 'CASHIER', 'LOAN_OFFICER', 'CUSTOMER_SERVICE', 'ATM_MANAGER', 'AUDITOR', 'CUSTOMER'];

const ROLE_ACCESS: Record<string, Role[]> = {
  '/': ALL_ROLES,
  '/accounts': ['ACCOUNTANT', 'CASHIER', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
  '/beneficiaries': ['CASHIER', 'CUSTOMER_SERVICE', 'CUSTOMER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/branches': ['BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/cards': ['CASHIER', 'CUSTOMER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/customers': ['CUSTOMER_SERVICE', 'CASHIER', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'ADMIN', 'SUPER_ADMIN'],
  '/employees': ['BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/transactions': ['ACCOUNTANT', 'CASHIER', 'CUSTOMER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/districts': ['ADMIN', 'SUPER_ADMIN'],
  '/divisions': ['ADMIN', 'SUPER_ADMIN'],
  '/police-stations': ['ADMIN', 'SUPER_ADMIN'],
  '/atms': ['ATM_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/atm-transactions': ['ATM_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/cashier-transactions': ['ACCOUNTANT', 'CASHIER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/loans': ['LOAN_OFFICER', 'CUSTOMER', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
  '/reports': ['ACCOUNTANT', 'AUDITOR', 'BRANCH_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
};

export function isModuleAllowedForRole(role: Role | null, path: string): boolean {
  if (!role) return true;
  const allowed = ROLE_ACCESS[path];
  if (!allowed) return true;
  return allowed.includes(role);
}
