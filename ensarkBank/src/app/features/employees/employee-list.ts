import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EmployeeService } from '../../services';
import { EmployeeResponse } from '../../models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './employee-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './employee-list.scss',
})
export class EmployeeList implements OnInit {
  private employeeService = inject(EmployeeService);
  employees = signal<EmployeeResponse[]>([]);
  loading = signal(true);
  error = signal('');

  activeCount = computed(() => this.employees().filter((e) => e.active).length);
  inactiveCount = computed(() => this.employees().filter((e) => !e.active).length);

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading.set(true);
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
