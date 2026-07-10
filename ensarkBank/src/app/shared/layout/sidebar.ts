import {
  Component,
  signal,
  HostBinding,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { BranchType } from '../../models';
import { isModuleAllowedForBranch } from '../branch-access';
import { AuthService } from '../../services/auth.service';
import { isModuleAllowedForRole } from '../role-access';
import { ToastService } from '../../services/toast.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  isOpen = signal(true);

  currentBranchType = signal<BranchType | null>(null);

  user = this.authService.user;
  role = this.authService.role;
  userName = this.authService.userName;

  @HostBinding('class.collapsed')
  get hostCollapsed() {
    return !this.isOpen();
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Accounts', path: '/accounts', icon: '💳' },
    { label: 'Beneficiaries', path: '/beneficiaries', icon: '👥' },
    { label: 'Branches', path: '/branches', icon: '🏢' },
    { label: 'Cards', path: '/cards', icon: '💰' },
    { label: 'Customers', path: '/customers', icon: '👤' },
    { label: 'Employees', path: '/employees', icon: '👨‍💼' },
    { label: 'Transactions', path: '/transactions', icon: '💸' },
    { label: 'Districts', path: '/districts', icon: '📍' },
    { label: 'Divisions', path: '/divisions', icon: '🗂️' },
    { label: 'Police Stations', path: '/police-stations', icon: '🚔' },
    { label: 'ATMs', path: '/atms', icon: '🏧' },
    { label: 'ATM Transactions', path: '/atm-transactions', icon: '💵' },
    { label: 'Cashier Transactions', path: '/cashier-transactions', icon: '🏦' },
    { label: 'Loans', path: '/loans', icon: '📋' },
    { label: 'Ledger', path: '/reports/ledger', icon: '📒' },
    { label: 'Trial Balance', path: '/reports/trial-balance', icon: '⚖️' },
    { label: 'Balance Sheet', path: '/reports/balance-sheet', icon: '📊' },
  ];

  visibleNavItems = computed(() => {
    const role = this.role();
    return this.navItems.filter(
      (item) =>
        isModuleAllowedForBranch(this.currentBranchType(), item.path) &&
        isModuleAllowedForRole(role, item.path),
    );
  });

  toggleSidebar() {
    this.isOpen.set(!this.isOpen());
  }

  logout() {
    this.authService.logout();
    this.toast.info('You have been logged out');
    this.router.navigateByUrl('/login');
  }
}
