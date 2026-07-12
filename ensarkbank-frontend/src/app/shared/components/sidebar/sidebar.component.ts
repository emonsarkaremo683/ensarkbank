import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/enums/role.enum';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  private authService = inject(AuthService);

  private readonly ALL_STAFF_ROLES: Role[] = [
    Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT,
    Role.CASHIER, Role.LOAN_OFFICER, Role.CUSTOMER_SERVICE, Role.ATM_MANAGER, Role.AUDITOR
  ];

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Employees', route: '/employees', icon: 'employees', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER] },
    { label: 'Branches', route: '/branches', icon: 'branches', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER] },
    { label: 'Customers', route: '/customers', icon: 'customers', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE] },
    { label: 'Accounts', route: '/accounts', icon: 'accounts', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE] },
    { label: 'Transactions', route: '/transactions', icon: 'transactions', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER] },
    { label: 'Loans', route: '/loans', icon: 'loans', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.LOAN_OFFICER, Role.ACCOUNTANT] },
    { label: 'Cards', route: '/cards', icon: 'cards', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.CUSTOMER_SERVICE] },
    { label: 'ATM', route: '/atm', icon: 'atm', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER, Role.BRANCH_MANAGER] },
    { label: 'KYC', route: '/kyc', icon: 'kyc', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE] },
    { label: 'Reports', route: '/reports', icon: 'reports', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.AUDITOR] },
    

    { label: 'Dashboard', route: '/customer/dashboard', icon: 'dashboard', roles: [Role.CUSTOMER] },
    { label: 'My Accounts', route: '/customer/accounts', icon: 'accounts', roles: [Role.CUSTOMER] },
    { label: 'My Transactions', route: '/customer/transactions', icon: 'transactions', roles: [Role.CUSTOMER] },
    { label: 'My Cards', route: '/customer/cards', icon: 'cards', roles: [Role.CUSTOMER] },
    { label: 'My Loans', route: '/customer/loans', icon: 'loans', roles: [Role.CUSTOMER] },
    { label: 'My Beneficiaries', route: '/customer/beneficiaries', icon: 'beneficiaries', roles: [Role.CUSTOMER] },
  ];

  user = this.authService.currentUser;

  visibleNavItems = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    const userRole = currentUser.role as Role;
    return this.navItems.filter(item => {
      if (!item.roles) return this.ALL_STAFF_ROLES.includes(userRole);
      return item.roles.includes(userRole);
    });
  });

  isCustomer(): boolean {
    return this.user()?.role === Role.CUSTOMER;
  }
}
