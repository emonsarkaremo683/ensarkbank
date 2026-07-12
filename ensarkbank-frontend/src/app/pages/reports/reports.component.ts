import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Branch, ReportRequest, TrialBalanceResponse, LedgerResponse, BalanceSheetResponse
} from '../../core/models';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

type ReportTab = 'trial-balance' | 'ledger' | 'balance-sheet';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  activeTab = signal<ReportTab>('trial-balance');
  branches = signal<Branch[]>([]);
  loading = signal(false);

  trialBalance = signal<TrialBalanceResponse | null>(null);
  ledger = signal<LedgerResponse | null>(null);
  balanceSheet = signal<BalanceSheetResponse | null>(null);

  tbForm = { branchId: 0, fromDate: '', toDate: '' };
  ledgerForm = { branchId: 0, accountNumber: '', fromDate: '', toDate: '' };
  bsForm = { branchId: 0, fromDate: '', toDate: '' };

  constructor(
    private api: ApiService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.api.getBranches().subscribe({
      next: data => this.branches.set(data),
      error: () => {}
    });
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const dateStr = this.formatDate(firstDay);
    const todayStr = this.formatDate(today);
    this.tbForm = { branchId: 0, fromDate: dateStr, toDate: todayStr };
    this.ledgerForm = { branchId: 0, accountNumber: '', fromDate: dateStr, toDate: todayStr };
    this.bsForm = { branchId: 0, fromDate: dateStr, toDate: todayStr };
  }

  setTab(tab: ReportTab): void {
    this.activeTab.set(tab);
    this.trialBalance.set(null);
    this.ledger.set(null);
    this.balanceSheet.set(null);
  }

  generateTrialBalance(): void {
    if (!this.tbForm.fromDate || !this.tbForm.toDate) {
      this.notify.warning('Validation', 'Please select date range');
      return;
    }
    this.loading.set(true);
    this.trialBalance.set(null);
    const request: ReportRequest = {
      branchId: this.tbForm.branchId || undefined,
      fromDate: this.tbForm.fromDate,
      toDate: this.tbForm.toDate
    };
    this.api.getTrialBalance(request).subscribe({
      next: data => { this.trialBalance.set(data); this.loading.set(false); },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to generate report');
        this.loading.set(false);
      }
    });
  }

  generateLedger(): void {
    if (!this.ledgerForm.accountNumber || !this.ledgerForm.fromDate || !this.ledgerForm.toDate) {
      this.notify.warning('Validation', 'Please fill all required fields');
      return;
    }
    this.loading.set(true);
    this.ledger.set(null);
    const request = {
      branchId: this.ledgerForm.branchId || undefined,
      accountNumber: this.ledgerForm.accountNumber,
      fromDate: this.ledgerForm.fromDate,
      toDate: this.ledgerForm.toDate
    };
    this.api.getLedger(request).subscribe({
      next: data => { this.ledger.set(data); this.loading.set(false); },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to generate ledger');
        this.loading.set(false);
      }
    });
  }

  generateBalanceSheet(): void {
    if (!this.bsForm.fromDate) {
      this.notify.warning('Validation', 'Please select a date');
      return;
    }
    this.loading.set(true);
    this.balanceSheet.set(null);
    const request: ReportRequest = {
      branchId: this.bsForm.branchId || undefined,
      fromDate: this.bsForm.fromDate,
      toDate: this.bsForm.toDate || this.bsForm.fromDate
    };
    this.api.getBalanceSheet(request).subscribe({
      next: data => { this.balanceSheet.set(data); this.loading.set(false); },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to generate balance sheet');
        this.loading.set(false);
      }
    });
  }

  printReport(): void {
    window.print();
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
