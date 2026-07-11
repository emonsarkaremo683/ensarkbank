import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="page-header"><h1>Reports</h1><p>Financial reports and analytics</p></div>
    <div class="d-flex gap-3 mb-4">
      <a routerLink="/reports/balance-sheet" class="btn btn-outline-primary">Balance Sheet</a>
      <a routerLink="/reports/custom" class="btn btn-outline-primary">Custom Report</a>
    </div>
    <router-outlet />
  `
})
export class ReportsComponent {}
