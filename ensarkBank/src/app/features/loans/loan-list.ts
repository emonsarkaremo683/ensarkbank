import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services';
import { LoanApplicationResponse } from '../../models';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.scss'
})
export class LoanList implements OnInit {
  private loanService = inject(LoanService);
  loans = signal<LoanApplicationResponse[]>([]);
  loading = signal(true);
  error = signal('');
  filterStatus = signal<string>('ALL');

  filteredLoans = computed(() => {
    const status = this.filterStatus();
    if (status === 'ALL') return this.loans();
    return this.loans().filter(l => l.status === status);
  });

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading.set(true);
    this.loanService.getAll().subscribe({
      next: (data) => { this.loans.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-yellow';
      case 'APPROVED': return 'badge-blue';
      case 'REJECTED': return 'badge-red';
      case 'DISBURSED':
      case 'ACTIVE': return 'badge-green';
      case 'CLOSED': return 'badge-light';
      case 'OVERDUE':
      case 'DEFAULTED': return 'badge-red';
      default: return 'badge-light';
    }
  }
}
