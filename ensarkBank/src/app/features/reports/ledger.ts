import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReportService, BranchService } from '../../services';
import { Branch, LedgerResponse, ReportRequest } from '../../models';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './ledger.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ledger.scss',
})
export class Ledger implements OnInit {
  private reportService = inject(ReportService);
  private branchService = inject(BranchService);

  branches = signal<Branch[]>([]);
  selectedBranchId = signal<number | null>(null);
  accountNumber = signal('');
  fromDate = signal('');
  toDate = signal('');

  ledger = signal<LedgerResponse | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.branchService.getAll().subscribe({
      next: (data) => this.branches.set(data),
      error: (err) => this.error.set(err.message),
    });
  }

  generate() {
    const branchId = this.selectedBranchId();
    const account = this.accountNumber().trim();
    if (branchId == null || !account) {
      this.error.set('Please select a branch and enter an account number.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const request: ReportRequest = {
      branchId,
      fromDate: this.fromDate() || null,
      toDate: this.toDate() || null,
    };
    this.reportService.getLedger(branchId, account, request).subscribe({
      next: (data) => {
        this.ledger.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
