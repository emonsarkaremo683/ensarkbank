import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { AccountService } from '../../services';
import { AccountResponse } from '../../models';
import { HistoryService } from '../../services/history.service';
import { History } from '../../models';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.scss'
})
export class AccountDetail implements OnInit {
  private accountService = inject(AccountService);
  private historyService = inject(HistoryService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef)

  account = signal<AccountResponse | null>(null);
  histories = signal<History[]>([]);
  history = signal<History | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(+id);
    }
  }

  loadAccount(id: number) {
    this.loading.set(true);
    this.accountService.getById(id).subscribe({
      next: (data) => {
        this.account.set(data);
        this.loadHistory(data.accountNumber);
      },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  loadHistory(accountNumber: string) {
    this.historyService.getHistoryByAccountNumber(accountNumber).subscribe({
      next: (data: History[]) => {
        this.histories.set(data);
        console.log(data);
        this.cdr.markForCheck();
        this.loading.set(false);
      },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }


  loadSingleData(id: number){
    this.historyService.getHistoryById(id).subscribe({
      next: (data: History) => {
        this.history.set(data); console.log(data); this.cdr.markForCheck(); this.loading.set(false);
      },
      error: (err: Error) =>{
       this.error.set(err.message); this.loading.set(false);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-green';
      case 'PENDING': return 'badge-yellow';
      case 'BLOCKED':
      case 'CLOSED': return 'badge-red';
      default: return 'badge-light';
    }
  }
}
