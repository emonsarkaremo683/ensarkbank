import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReportService, BranchService } from '../../services';
import { Branch, BalanceSheetResponse, ReportRequest } from '../../models';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './balance-sheet.html',
  styleUrl: './balance-sheet.scss'
})
export class BalanceSheet implements OnInit {
  private reportService = inject(ReportService);
  private branchService = inject(BranchService);

  branches = signal<Branch[]>([]);
  selectedBranchId = signal<number | null>(null);
  fromDate = signal('');
  toDate = signal('');

  report = signal<BalanceSheetResponse | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit() {
    this.branchService.getAll().subscribe({
      next: (data) => this.branches.set(data),
      error: (err) => this.error.set(err.message)
    });
  }

  generate() {
    this.loading.set(true);
    this.error.set('');
    const request: ReportRequest = {
      branchId: this.selectedBranchId(),
      fromDate: this.fromDate() || null,
      toDate: this.toDate() || null
    };
    this.reportService.getBalanceSheet(request).subscribe({
      next: (data) => { this.report.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
