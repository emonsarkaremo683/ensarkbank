import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  mobileMenuOpen = signal(false);

  features = [
    {
      icon: '🏦',
      title: 'Online Banking',
      description: 'Manage your accounts, transfer funds, and pay bills 24/7 from anywhere in the world.'
    },
    {
      icon: '📱',
      title: 'Mobile Payments',
      description: 'Send and receive money instantly with our secure mobile payment platform.'
    },
    {
      icon: '💰',
      title: 'Loans & Credit',
      description: 'Competitive rates on personal, home, and business loans tailored to your needs.'
    },
    {
      icon: '💳',
      title: 'Debit & Credit Cards',
      description: 'Global acceptance with chip-enabled secure cards and real-time notifications.'
    },
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Multi-layer encryption, biometric login, and fraud monitoring protect your assets.'
    },
    {
      icon: '🕐',
      title: '24/7 Support',
      description: 'Our dedicated support team is always available to assist you via chat, phone, or email.'
    }
  ];

  stats = [
    { value: '2M+', label: 'Active Customers' },
    { value: '150+', label: 'Branches Nationwide' },
    { value: '$50B+', label: 'Transactions Processed' },
    { value: '99.9%', label: 'Uptime Guarantee' }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
