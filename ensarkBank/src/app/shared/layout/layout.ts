import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);

  navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Branches', path: '/branches', icon: '🏦' },
    { label: 'Employees', path: '/employees', icon: '👥' },
    { label: 'Customers', path: '/customers', icon: '👤' },
    { label: 'Accounts', path: '/accounts', icon: '💳' },
    { label: 'Cards', path: '/cards', icon: ' plastic' },
    { label: 'Transactions', path: '/transactions', icon: '💸' },
    { label: 'Beneficiaries', path: '/beneficiaries', icon: '🤝' },
    { label: 'Divisions', path: '/divisions', icon: '🗺️' },
    { label: 'Districts', path: '/districts', icon: '📍' },
    { label: 'Police Stations', path: '/police-stations', icon: '🚔' },
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }
}
