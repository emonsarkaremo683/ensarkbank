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
    { label: 'Reports', route: '/reports', icon: 'reports', roles: [Role.ACCOUNTANT, Role.AUDITOR] },
    { label: 'Journals', route: '/journals', icon: 'journals', roles: [Role.ACCOUNTANT] },
    { label: 'Cashier Transactions', route: '/cashier-transactions', icon: 'cashier', roles: [Role.CASHIER] },
    { label: 'Loans', route: '/loans', icon: 'loans', roles: [Role.LOAN_OFFICER] },
    { label: 'Customers', route: '/customers', icon: 'customers', roles: [Role.CUSTOMER_SERVICE] },
    { label: 'ATMs', route: '/atms', icon: 'atm', roles: [Role.ATM_MANAGER] },
    { label: 'Audit Logs', route: '/audit-logs', icon: 'audit', roles: [Role.AUDITOR] },
    { label: 'Settings', route: '/settings', icon: 'settings', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { label: 'My Accounts', route: '/my-accounts', icon: 'accounts', roles: [Role.CUSTOMER] },
    { label: 'My Transactions', route: '/my-transactions', icon: 'transactions', roles: [Role.CUSTOMER] },
    { label: 'My Cards', route: '/my-cards', icon: 'cards', roles: [Role.CUSTOMER] },
    { label: 'Beneficiaries', route: '/beneficiaries', icon: 'beneficiaries', roles: [Role.CUSTOMER] },
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
