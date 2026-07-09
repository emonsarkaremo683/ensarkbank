import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services';
import { CustomerResponse } from '../../models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss'
})
export class CustomerList implements OnInit {
  private customerService = inject(CustomerService);
  customers = signal<CustomerResponse[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');
  filterStatus = signal<string>('ALL');

  filteredCustomers = computed(() => {
    let list = this.customers();
    const term = this.searchTerm().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term)
      );
    }

    if (status !== 'ALL') {
      list = list.filter(c => status === 'ACTIVE' ? c.active : !c.active);
    }

    return list;
  });

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.customerService.getAll().subscribe({
      next: (data) => { this.customers.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
