import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Branches</h1>
        <p>Manage bank branches</p>
      </div>
      <a routerLink="/branches/new" class="btn btn-primary">+ New Branch</a>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Routing</th><th>Status</th></tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>@for (j of [1,2,3,4,5,6]; track j) { <td><div class="skeleton"></div></td> }</tr>
                }
              } @else if (branches().length === 0) {
                <tr><td colspan="6" class="text-center py-5 text-muted">No branches found</td></tr>
              } @else {
                @for (b of branches(); track b.id) {
                  <tr>
                    <td class="fw-semibold">{{ b.name }}</td>
                    <td class="text-muted">{{ b.email }}</td>
                    <td>{{ b.phoneNumber }}</td>
                    <td>{{ b.type }}</td>
                    <td class="font-mono">{{ b.routingNumber }}</td>
                    <td><app-status-badge [status]="b.status" /></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton { height: 16px; background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; width: 80%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .font-mono { font-size: 13px; }
  `]
})
export class BranchListComponent implements OnInit {
  private http = inject(HttpClient);
  branches = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/branches`).subscribe({
      next: (data) => { this.branches.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
