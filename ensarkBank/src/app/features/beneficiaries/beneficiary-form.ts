import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BeneficiaryService } from '../../services';
import { CustomerService } from '../../services';
import { BeneficiaryRequest, CustomerResponse } from '../../models';

@Component({
  selector: 'app-beneficiary-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './beneficiary-form.html',
  styleUrl: './beneficiary-form.scss'
})
export class BeneficiaryForm implements OnInit {
  private beneficiaryService = inject(BeneficiaryService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  beneficiary: BeneficiaryRequest = {
    accNumber: '',
    name: '',
    provider: '',
    beneficiaryType: 'BANK',
    customerId: 0
  };

  customers = signal<CustomerResponse[]>([]);
  loading = signal(false);
  error = signal('');

  beneficiaryTypes = ['BKASH', 'NAGAD', 'BANK', 'CARD'];

  ngOnInit() {
    this.customerService.getAll().subscribe({ next: (data) => this.customers.set(data) });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.beneficiaryService.create(this.beneficiary).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/beneficiaries']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
