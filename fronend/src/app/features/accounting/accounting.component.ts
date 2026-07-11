import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="page-header"><h1>Accounting</h1><p>Double-entry bookkeeping and financial reports</p></div>
    <div class="d-flex gap-3 mb-4">
      <a routerLink="/accounting/journal" class="btn btn-outline-primary">Journal Entries</a>
      <a routerLink="/accounting/ledger" class="btn btn-outline-primary">Ledger</a>
      <a routerLink="/accounting/trial-balance" class="btn btn-outline-primary">Trial Balance</a>
    </div>
    <router-outlet />
  `
})
export class AccountingComponent {}
