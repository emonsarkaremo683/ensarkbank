import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0">
        <h1>Employees</h1>
        <p>Manage bank employees and designations</p>
      </div>
      <a routerLink="/employees/new" class="btn btn-primary">+ New Employee</a>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Designation</th>
                <th>Branch</th>
                <th>Phone</th>
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
              } @else if (employees().length === 0) {
                <tr><td colspan="6" class="text-center py-5 text-muted">No employees found</td></tr>
              } @else {
                @for (e of employees(); track e.id) {
                  <tr style="cursor: pointer" [routerLink]="['/employees', e.id]">
                    <td class="fw-semibold">{{ e.name }}</td>
                    <td class="text-muted">{{ e.email }}</td>
                    <td>{{ e.designation }}</td>
                    <td>{{ e.branchName }}</td>
                    <td>{{ e.phone }}</td>
                    <td><a [routerLink]="['/employees', e.id]" class="btn btn-sm btn-outline-primary">View</a></td>
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
export class EmployeeListComponent implements OnInit {
  private http = inject(HttpClient);
  employees = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/employee/`).subscribe({
      next: (data) => { this.employees.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
