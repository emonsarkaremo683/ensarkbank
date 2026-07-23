import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/enums/role.enum';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: Role[];
}

interface NavGroup {
  label: string;
  icon: string;
  roles?: Role[];
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  host: {
    '[class.collapsed]': 'collapsed',
    '[class.sidebar-mobile-open]': 'mobileOpen'
  }
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() mobileOpen = false;

  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  private readonly ALL_STAFF_ROLES: Role[] = [
    Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT,
    Role.CASHIER, Role.LOAN_OFFICER, Role.CUSTOMER_SERVICE, Role.ATM_MANAGER, Role.AUDITOR
  ];

  private readonly icons: Record<string, string> = {
    'layout-dashboard': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'building': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/></svg>',
    'layers': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'map-pin': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'credit-card': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    'wallet': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="22" height="16" rx="2"/><path d="M1 6V4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v2"/><circle cx="16" cy="14" r="2"/></svg>',
    'arrow-left-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    'cash': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    'banknote': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><line x1="6" y1="11" x2="8" y2="11"/><line x1="16" y1="11" x2="18" y2="11"/></svg>',
    'landmark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
    'settings': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    'monitor': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    'bar-chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  };

  getIcon(name: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icons[name] || '');
  }

  staffNavGroups: NavGroup[] = [
    {
      label: 'Organization',
      icon: 'grid',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER],
      items: [
        { label: 'Employees', route: '/employees', icon: 'users', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER] },
        { label: 'Branches', route: '/branches', icon: 'building', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER] },
        { label: 'Divisions', route: '/divisions', icon: 'layers', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
        { label: 'Districts', route: '/districts', icon: 'map-pin', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
        { label: 'Police Stations', route: '/police-stations', icon: 'shield', roles: [Role.SUPER_ADMIN, Role.ADMIN] },
      ]
    },
    {
      label: 'Customers',
      icon: 'users',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE],
      items: [
        { label: 'All Customers', route: '/customers', icon: 'users', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE] },
        { label: 'KYC Verification', route: '/kyc', icon: 'shield', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CUSTOMER_SERVICE] },
      ]
    },
    {
      label: 'Accounts & Transactions',
      icon: 'credit-card',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE],
      items: [
        { label: 'Accounts', route: '/accounts', icon: 'wallet', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE] },
        { label: 'Transactions', route: '/transactions', icon: 'arrow-left-right', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE] },
        { label: 'Cashier Ops', route: '/transactions/cashier', icon: 'cash', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER] },
      ]
    },
    {
      label: 'Financial Products',
      icon: 'banknote',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.LOAN_OFFICER, Role.ACCOUNTANT, Role.CASHIER, Role.CUSTOMER_SERVICE],
      items: [
        { label: 'Loans', route: '/loans', icon: 'landmark', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.LOAN_OFFICER, Role.ACCOUNTANT] },
        { label: 'Cards', route: '/cards', icon: 'credit-card', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.CASHIER, Role.CUSTOMER_SERVICE] },
      ]
    },
    {
      label: 'Infrastructure',
      icon: 'settings',
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER, Role.BRANCH_MANAGER, Role.AUDITOR],
      items: [
        { label: 'ATM Network', route: '/atm', icon: 'monitor', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ATM_MANAGER, Role.BRANCH_MANAGER] },
        { label: 'Reports', route: '/reports', icon: 'bar-chart', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.AUDITOR] },
      ]
    }
  ];

  staffTopItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
    { label: 'Profile', route: '/profile', icon: 'user', roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.BRANCH_MANAGER, Role.ACCOUNTANT, Role.CASHIER, Role.LOAN_OFFICER, Role.CUSTOMER_SERVICE, Role.ATM_MANAGER, Role.AUDITOR] },
  ];

  customerNavItems: NavItem[] = [
    { label: 'Dashboard', route: '/customer/dashboard', icon: 'layout-dashboard', roles: [Role.CUSTOMER] },
    { label: 'My Accounts', route: '/customer/accounts', icon: 'wallet', roles: [Role.CUSTOMER] },
    { label: 'My Transactions', route: '/customer/transactions', icon: 'arrow-left-right', roles: [Role.CUSTOMER] },
    { label: 'My Cards', route: '/customer/cards', icon: 'credit-card', roles: [Role.CUSTOMER] },
    { label: 'My Loans', route: '/customer/loans', icon: 'landmark', roles: [Role.CUSTOMER] },
    { label: 'My Beneficiaries', route: '/customer/beneficiaries', icon: 'users', roles: [Role.CUSTOMER] },
    { label: 'My KYC', route: '/customer/kyc', icon: 'shield', roles: [Role.CUSTOMER] },
    { label: 'My Profile', route: '/customer/profile', icon: 'user', roles: [Role.CUSTOMER] },
  ];

  expandedGroups = signal<Set<string>>(new Set(['Organization', 'Customers', 'Accounts & Transactions', 'Financial Products', 'Infrastructure']));

  user = this.authService.currentUser;

  visibleStaffTopItems = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    const userRole = currentUser.role as Role;
    return this.staffTopItems.filter(item => {
      if (!item.roles) return this.ALL_STAFF_ROLES.includes(userRole);
      return item.roles.includes(userRole);
    });
  });

  visibleStaffGroups = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    const userRole = currentUser.role as Role;
    return this.staffNavGroups
      .map(group => {
        const visibleItems = group.items.filter(item => {
          if (!item.roles) return this.ALL_STAFF_ROLES.includes(userRole);
          return item.roles.includes(userRole);
        });
        const groupVisible = !group.roles || group.roles.includes(userRole);
        return { ...group, items: visibleItems, visible: groupVisible && visibleItems.length > 0 };
      })
      .filter(group => group.visible);
  });

  visibleCustomerNavItems = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];
    const userRole = currentUser.role as Role;
    return this.customerNavItems.filter(item => {
      if (!item.roles) return this.ALL_STAFF_ROLES.includes(userRole);
      return item.roles.includes(userRole);
    });
  });

  toggleGroup(label: string): void {
    const current = this.expandedGroups();
    const next = new Set(current);
    if (next.has(label)) {
      next.delete(label);
    } else {
      next.add(label);
    }
    this.expandedGroups.set(next);
  }

  isGroupExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  isCustomer(): boolean {
    return this.user()?.role === Role.CUSTOMER;
  }
}
