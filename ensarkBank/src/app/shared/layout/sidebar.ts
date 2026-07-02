import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
    { label: 'Police Stations', path: '/police-stations', icon: '🚔' }
  ];

  toggleSidebar() {
    this.isOpen.set(!this.isOpen());
  }
}
