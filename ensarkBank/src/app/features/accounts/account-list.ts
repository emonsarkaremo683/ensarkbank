import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services';
import { AccountResponse } from '../../models';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './account-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account-list.scss',
})
export class AccountList implements OnInit {
  private accountService = inject(AccountService);

  accounts = signal<AccountResponse[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  filterStatus = signal<string>('ALL');

  filteredAccounts = computed(() => {
    let list = this.accounts();
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(
        (a) =>
          a.accountNumber.toLowerCase().includes(term) ||
          a.accountType.toLowerCase().includes(term) ||
          (a.branchName && a.branchName.toLowerCase().includes(term)),
      );
    }

    if (status !== 'ALL') {
      list = list.filter((a) => a.accountStatus === status);
    }

    return list;
  });

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading.set(true);
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getTotalBalance(): number {
    return this.accounts().reduce((sum, a) => sum + (a.availableBalance || 0), 0);
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
