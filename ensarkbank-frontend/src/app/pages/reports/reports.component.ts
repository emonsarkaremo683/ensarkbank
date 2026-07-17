import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Branch, ReportRequest, TrialBalanceResponse, LedgerResponse, LedgerLine, BalanceSheetResponse
} from '../../core/models';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Role } from '../../core/enums/role.enum';

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
  ledgers = signal<LedgerResponse[]>([]);
  balanceSheet = signal<BalanceSheetResponse | null>(null);

  allLedgerEntries = computed(() => {
    return this.ledgers().flatMap(l => l.entries || []);
  });

  tbForm = { branchId: 0, fromDate: '', toDate: '' };
  ledgerForm = { branchId: 0, fromDate: '', toDate: '' };
  bsForm = { branchId: 0, fromDate: '', toDate: '' };

  private headOfficeRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.AUDITOR, Role.ACCOUNTANT];
  isHeadOfficeUser = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const isAllowedRole = this.headOfficeRoles.includes(user.role as Role);
    // ACCOUNTANT at head office (no branchId) can see all branches
    // ACCOUNTANT at a branch (has branchId) can only see their branch
    if (user.role === Role.ACCOUNTANT && user.branchId) return false;
    return isAllowedRole;
  });
  userBranchId = computed(() => this.auth.currentUser()?.branchId ?? 0);

  constructor(
    private api: ApiService,
    private auth: AuthService,
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

    const user = this.auth.currentUser();
    const branchId = this.isHeadOfficeUser() ? 0 : (user?.branchId ?? 0);

    this.tbForm = { branchId, fromDate: dateStr, toDate: todayStr };
    this.ledgerForm = { branchId, fromDate: dateStr, toDate: todayStr };
    this.bsForm = { branchId, fromDate: dateStr, toDate: todayStr };
  }

  private buildRequest(branchId: number, fromDate: string, toDate: string): ReportRequest {
    const user = this.auth.currentUser();
    return {
      branchId: branchId > 0 ? branchId : undefined,
      fromDate,
      toDate,
      role: user?.role,
      userBranchId: user?.branchId
    };
  }

  setTab(tab: ReportTab): void {
    this.activeTab.set(tab);
    this.trialBalance.set(null);
    this.ledgers.set([]);
    this.balanceSheet.set(null);
  }

  generateTrialBalance(): void {
    if (!this.tbForm.fromDate || !this.tbForm.toDate) {
      this.notify.warning('Validation', 'Please select date range');
      return;
    }
    this.loading.set(true);
    this.trialBalance.set(null);
    const request = this.buildRequest(this.tbForm.branchId, this.tbForm.fromDate, this.tbForm.toDate);
    this.api.getTrialBalance(request).subscribe({
      next: data => { this.trialBalance.set(data); this.loading.set(false); },
      error: (err) => {
        this.notify.error('Error', err.error?.message || 'Failed to generate report');
        this.loading.set(false);
      }
    });
  }

  generateLedger(): void {
    if (!this.ledgerForm.fromDate || !this.ledgerForm.toDate) {
      this.notify.warning('Validation', 'Please select date range');
      return;
    }
    this.loading.set(true);
    this.ledgers.set([]);
    const request = this.buildRequest(this.ledgerForm.branchId, this.ledgerForm.fromDate, this.ledgerForm.toDate);
    this.api.getLedger(request).subscribe({
      next: data => { this.ledgers.set(data); this.loading.set(false); },
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
    const request = this.buildRequest(this.bsForm.branchId, this.bsForm.fromDate, this.bsForm.toDate || this.bsForm.fromDate);
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
