import { Component, signal, HostBinding, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BranchType } from '../../models';
import { isModuleAllowedForBranch } from '../branch-access';

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
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  isOpen = signal(true);

  /** Branch context for the logged-in outlet. null = unrestricted (no auth in this app). */
  currentBranchType = signal<BranchType | null>(null);

  @HostBinding('class.collapsed')
  get hostCollapsed() {
    return !this.isOpen();
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: '📊' },
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
    { label: 'Balance Sheet', path: '/reports/balance-sheet', icon: '📊' }
  ];

  visibleNavItems = computed(() =>
    this.navItems.filter(item => isModuleAllowedForBranch(this.currentBranchType(), item.path))
  );

  toggleSidebar() {
    this.isOpen.set(!this.isOpen());
  }
}
