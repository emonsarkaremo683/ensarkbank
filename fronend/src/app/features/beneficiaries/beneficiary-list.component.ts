import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0"><h1>Beneficiaries</h1><p>Manage saved beneficiaries</p></div>
      <button class="btn btn-primary">+ Add Beneficiary</button>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Name</th><th>Account Number</th><th>Provider</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              @if (beneficiaries().length === 0) {
                <tr><td colspan="5" class="text-center py-5 text-muted">No beneficiaries found</td></tr>
              } @else {
                @for (b of beneficiaries(); track b.id) {
                  <tr>
                    <td class="fw-semibold">{{ b.name }}</td>
                    <td class="font-mono">{{ b.accNumber }}</td>
                    <td>{{ b.provider }}</td>
                    <td>{{ b.beneficiaryType }}</td>
                    <td><button class="btn btn-sm btn-outline-danger">Remove</button></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.font-mono { font-size: 13px; }`]
})
export class BeneficiaryListComponent implements OnInit {
  private http = inject(HttpClient);
  beneficiaries = signal<any[]>([]);
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/beneficiary/`).subscribe({ next: (d) => this.beneficiaries.set(d) });
  }
}
