import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Role } from '../../core/enums/role.enum';
import { CustomerResponse } from '../../core/models';
import { LoadingComponent } from '../../shared';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, DataTableComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  loading = signal(true);
  showModal = signal(false);
  showConfirm = signal(false);
  searchQuery = signal('');
  selectedCustomer = signal<CustomerResponse | null>(null);
  customers = signal<CustomerResponse[]>([]);

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'email', label: 'Email', type: 'text', sortable: true },
    { key: 'phone', label: 'Phone', type: 'text', sortable: true },
    { key: 'occupation', label: 'Occupation', type: 'text', sortable: true },
    { key: 'active', label: 'Status', type: 'status', sortable: true },
    { key: 'actions', label: 'Actions', type: 'actions', sortable: false },
  ];

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.api.getCustomers().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Error', 'Failed to load customers.');
      }
    });
  }

  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.customers();
    return this.customers().filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.occupation?.toLowerCase().includes(query)
    );
  });

  onAction(event: { type: string; row: CustomerResponse }): void {
    if (event.type === 'edit' || event.type === 'view') {
      this.viewCustomer(event.row);
    }
  }

  viewCustomer(customer: CustomerResponse): void {
    this.selectedCustomer.set(customer);
    this.showModal.set(true);
  }

  updateKycStatus(customer: CustomerResponse, newStatus: string): void {
    this.api.updateKycStatus(customer.id, newStatus).subscribe({
      next: () => {
        this.notify.success('Updated', `${customer.name}'s status updated.`);
        this.loadCustomers();
      },
      error: () => {
        this.notify.error('Error', 'Failed to update status.');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedCustomer.set(null);
  }

}
