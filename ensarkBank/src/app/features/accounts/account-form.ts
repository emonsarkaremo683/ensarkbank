import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService, BeneficiaryService } from '../../services';
import { BranchService } from '../../services';
import { CustomerService } from '../../services';
import { AccountRequest, BeneficiaryResponse, Branch, CustomerResponse } from '../../models';

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
  private beneficiaryService = inject(BeneficiaryService);
  

  account: AccountRequest = {
    accountType: 'SAVINGS',
    availableBalance: 0,
    branchId: 0,
    accountStatus: 'PENDING',
    n_name: '',
    n_email: '',
    n_phone: '',
    n_photo: '',
    n_nid_front: '',
    n_nid_back: '',
    accountHolders: []
  };

  branches = signal<Branch[]>([]);
  customers = signal<CustomerResponse[]>([]);
  loading = signal(false);
  beneficiary = signal<BeneficiaryResponse[]>([]);
  error = signal('');

  photoFile: File | null = null;
  nidFrontFile: File | null = null;
  nidBackFile: File | null = null;

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

  onFileChange(event: Event, field: 'photo' | 'nidFront' | 'nidBack') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      switch (field) {
        case 'photo': this.photoFile = file; break;
        case 'nidFront': this.nidFrontFile = file; break;
        case 'nidBack': this.nidBackFile = file; break;
      }
    }
  }

  onSubmit() {
    if (!this.photoFile || !this.nidFrontFile || !this.nidBackFile) {
      this.error.set('Please upload nominee photo, NID front, and NID back.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.accountService.create(this.account, this.photoFile, this.nidFrontFile, this.nidBackFile).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/accounts']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
