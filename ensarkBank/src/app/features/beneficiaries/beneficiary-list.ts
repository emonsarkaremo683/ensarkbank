import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeneficiaryService } from '../../services';
import { BeneficiaryResponse } from '../../models';

@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './beneficiary-list.html',
  styleUrl: './beneficiary-list.scss'
})
export class BeneficiaryList implements OnInit {
  private beneficiaryService = inject(BeneficiaryService);
  beneficiaries = signal<BeneficiaryResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadBeneficiaries();
  }

  loadBeneficiaries() {
    this.loading.set(true);
    this.beneficiaryService.getAll().subscribe({
      next: (data) => { this.beneficiaries.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
