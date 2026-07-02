import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../services';
import { EmployeeResponse } from '../../models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {
  private employeeService = inject(EmployeeService);
  employees = signal<EmployeeResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading.set(true);
    this.employeeService.getAll().subscribe({
      next: (data) => { this.employees.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
