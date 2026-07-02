import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services';
import { BranchService } from '../../services';
import { CustomerService } from '../../services';
import { AccountRequest, Branch, CustomerResponse, AccountHolderRequest } from '../../models';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './account-form.html',
  styleUrl: './account-form.scss'
})
export class AccountForm implements OnInit {
  private accountService = inject(AccountService);
  private branchService = inject(BranchService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  account: AccountRequest = {
    accountType: 'SAVINGS',
    availableBalance: 0,
    branchId: 0,
    accountStatus: 'PENDING',
    accountHolders: []
  };

  branches = signal<Branch[]>([]);
  customers = signal<CustomerResponse[]>([]);
  loading = signal(false);
  error = signal('');

  accountTypes = ['SAVINGS', 'CURRENT', 'FIXED_DEPOSIT', 'JOINT_ACCOUNT', 'STUDENT', 'BUSINESS'];
  accountStatuses = ['ACTIVE', 'INACTIVE', 'PENDING'];
  holderTypes = ['PRIMARY', 'SECONDARY', 'OPTIONAL'];

  ngOnInit() {
    this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
    this.customerService.getAll().subscribe({ next: (data) => this.customers.set(data) });
    this.addHolder();
  }

  addHolder() {
    this.account.accountHolders.push({
      holderType: 'PRIMARY',
      canWithdraw: true,
      canDeposit: true,
      canApproveTransaction: false,
      customerId: 0
    });
  }

  removeHolder(index: number) {
    this.account.accountHolders.splice(index, 1);
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    this.accountService.create(this.account).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/accounts']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
