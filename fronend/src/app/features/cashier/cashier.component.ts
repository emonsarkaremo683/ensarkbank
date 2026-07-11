import { Component } from '@angular/core';

@Component({
  selector: 'app-cashier',
  standalone: true,
  template: `
    <div class="page-header"><h1>Cashier</h1><p>Process cashier transactions</p></div>
    <div class="card">
      <div class="card-body">
        <p class="text-muted text-center py-4">Cashier transaction form will be implemented here.</p>
      </div>
    </div>
  `
})
export class CashierComponent {}
