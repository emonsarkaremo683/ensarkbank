import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Customers</h1>
        <p>Manage customer accounts and KYC</p>
      </div>
      <a routerLink="/customers/new" class="btn btn-primary">
        + New Customer
      </a>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="search-box">
            <input type="text" class="form-control" placeholder="Search customers..." [(ngModel)]="searchTerm" (input)="filterCustomers()" style="max-width: 300px;" />
          </div>
        </div>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Occupation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr>
                    @for (j of [1,2,3,4,5,6]; track j) {
                      <td><div class="skeleton"></div></td>
                    }
                  </tr>
                }
              } @else if (customers().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-5 text-muted">No customers found</td>
                </tr>
              } @else {
                @for (c of customers(); track c.id) {
                  <tr style="cursor: pointer" [routerLink]="['/customers', c.id]">
                    <td class="fw-semibold">{{ c.name }}</td>
                    <td class="text-muted">{{ c.email }}</td>
                    <td>{{ c.phone }}</td>
                    <td>{{ c.occupation }}</td>
                    <td>
                      @if (c.active) {
                        <span class="badge" style="color:#065F46;background:#D1FAE5;">ACTIVE</span>
                      } @else {
                        <span class="badge" style="color:#991B1B;background:#FEE2E2;">INACTIVE</span>
                      }
                    </td>
                    <td>
                      <a [routerLink]="['/customers', c.id]" class="btn btn-sm btn-outline-primary">View</a>
                    </td>
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
  `]
})
export class CustomerListComponent implements OnInit {
  private http = inject(HttpClient);
  customers = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/customer/`).subscribe({
      next: (data) => { this.customers.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  filterCustomers() {
    // Client-side filtering would go here
  }
}
