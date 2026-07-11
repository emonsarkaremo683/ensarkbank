import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-atm-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, DecimalPipe],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0"><h1>ATMs</h1><p>Manage ATM machines</p></div>
      <a routerLink="/atms/new" class="btn btn-primary">+ Add ATM</a>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>ID</th><th>Address</th><th>Branch</th><th>Limit</th><th>Status</th></tr></thead>
            <tbody>
              @if (atms().length === 0) {
                <tr><td colspan="5" class="text-center py-5 text-muted">No ATMs found</td></tr>
              } @else {
                @for (a of atms(); track a.atmId) {
                  <tr>
                    <td class="font-mono">#{{ a.atmId }}</td>
                    <td>{{ a.address }}</td>
                    <td>{{ a.branchName }}</td>
                    <td>৳ {{ a.limit | number:'1.2-2' }}</td>
                    <td><app-status-badge [status]="a.status" /></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.font-mono { font-size: 13px; }`]
})
export class AtmListComponent implements OnInit {
  private http = inject(HttpClient);
  atms = signal<any[]>([]);
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/atm/all`).subscribe({ next: (d) => this.atms.set(d) });
  }
}
