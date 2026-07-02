import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AccountService } from '../../services';
import { AccountResponse } from '../../models';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss'
})
export class AccountList implements OnInit {
  private accountService = inject(AccountService);
  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading.set(true);
    this.accountService.getAll().subscribe({
      next: (data) => { this.accounts.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getTotalBalance(): number {
    return this.accounts().reduce((sum, a) => sum + (a.availableBalance || 0), 0);
  }
}
