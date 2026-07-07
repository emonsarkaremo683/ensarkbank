import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, shareReplay, startWith } from 'rxjs';
import { CashierTransactionService } from '../../services';
import { BranchService } from '../../services';
import { AccountService } from '../../services';
import { CashierTransactionRequest, Branch, AccountResponse, TransactionChannel, TransactionType } from '../../models';

@Component({
  selector: 'app-cashier-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatOptionModule],
  templateUrl: './cashier-transaction-form.html',
  styleUrl: './cashier-transaction-form.scss'
})
export class CashierTransactionForm implements OnInit {
  private cashierTxService = inject(CashierTransactionService);
  private branchService = inject(BranchService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  request: CashierTransactionRequest = {
    checkNo: '',
    branchId: 0,
    accountNumber: '',
    accountName: '',
    bankName: '',
    transactionRequest: {
      transactionType: 'DEPOSIT',
      channel: 'BRANCH',
      amount: 0,
      remarks: ''
    }
  };

  branches = signal<Branch[]>([]);
  accounts = signal<AccountResponse[]>([]);
  private accounts$ = new BehaviorSubject<AccountResponse[]>([]);

  loading = signal(false);
  error = signal('');
  success = signal('');

  transactionTypes = ['DEPOSIT', 'WITHDRAW'];
  channels = ['BRANCH'];

  cashierForm = new FormGroup({
    branchId: new FormControl<number | null>(null, {
      nonNullable: true,
      validators: [Validators.required]
    }),

    accountQuery: new FormControl<string | AccountResponse>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    accountNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),

    accountName: new FormControl<string>(
      { value: '', disabled: true },
      Validators.required
    ),

    bankName: new FormControl<string>(
      { value: '', disabled: true },
      { nonNullable: true, validators: Validators.required }
    ),

    checkNo: new FormControl<string>(''),

    transactionRequest: new FormGroup({
      transactionType: new FormControl<TransactionType>('DEPOSIT', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      channel: new FormControl<TransactionChannel>('BRANCH', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      amount: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(0.01)]
      }),
      remarks: new FormControl<string>('')
    })
  });

  filteredAccounts$: Observable<AccountResponse[]> = combineLatest([
    this.accounts$.asObservable(),
    this.cashierForm.controls.accountQuery.valueChanges.pipe(
      startWith(''),
      debounceTime(150),
      distinctUntilChanged((a, b) => {
        const aValue = typeof a === 'string' ? a : a?.accountNumber ?? '';
        const bValue = typeof b === 'string' ? b : b?.accountNumber ?? '';
        return aValue === bValue;
      })
    )
  ]).pipe(
    map(([accounts, query]) => {
      const normalized = typeof query === 'string' ? query.trim().toLowerCase() : query?.accountNumber.toLowerCase() ?? '';
      if (!normalized) {
        return accounts.slice(0, 50);
      }
      return accounts.filter((account) => account.accountNumber.toLowerCase().includes(normalized));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  get accountQueryControl() {
    return this.cashierForm.controls.accountQuery as FormControl<string | AccountResponse>;
  }

  get accountNumberControl() {
    return this.cashierForm.controls.accountNumber as FormControl<string>;
  }

  trackByBranch(index: number, branch: Branch) {
    return branch.id;
  }

  trackByString(index: number, value: string) {
    return value;
  }

  ngOnInit() {
    this.branchService.getAll().subscribe({ next: (data) => this.branches.set(data) });
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.accounts$.next(data);
      }
    });

    this.accountQueryControl.valueChanges.pipe(
      distinctUntilChanged((prev, next) => {
        const prevValue = typeof prev === 'string' ? prev : prev?.accountNumber ?? '';
        const nextValue = typeof next === 'string' ? next : next?.accountNumber ?? '';
        return prevValue === nextValue;
      })
    ).subscribe((value) => {
      if (typeof value === 'string') {
        this.accountNumberControl.setValue('', { emitEvent: false });
      }
    });
  }

  displayAccount(account: AccountResponse | string): string {
    if (!account) {
      return '';
    }
    return typeof account === 'string'
      ? account
      : `${account.accountNumber}`;
  }

  onAccountSelected(event: MatAutocompleteSelectedEvent): void {

    const account = event.option.value as AccountResponse;

    if (!account) return;

    this.accountNumberControl.setValue(account.accountNumber);

    this.cashierForm.patchValue({
      accountName: account.holderResponses[0]?.accountHolderName ?? '',
      bankName: 'Ensark Bank'
    });

    this.cashierForm.controls.accountName.disable();
    this.cashierForm.controls.bankName.disable();
  }

  onSubmit() {
    if (this.cashierForm.invalid) {
      this.cashierForm.markAllAsTouched();
      return;
    }

    const value = this.cashierForm.value as {
      checkNo: string | null;
      branchId: number | null;
      accountNumber: string | null;
      accountName: string | null,
      bankName: string | 'Ensark Bank',
      transactionRequest?: {
        transactionType: TransactionType | null;
        channel: TransactionChannel | null;
        amount: number | null;
        remarks: string | null;
      };
    };

    const transactionRequest = value.transactionRequest ?? {
      transactionType: 'DEPOSIT' as TransactionType,
      channel: 'BRANCH' as TransactionChannel,
      amount: 0,
      remarks: ''
    };

    this.request = {
      checkNo: value.checkNo ?? '',
      branchId: value.branchId ?? 0,
      accountNumber: value.accountNumber ?? '',
      accountName: value.accountName ?? '',
      bankName: value.bankName ?? '',
      transactionRequest: {
        transactionType: transactionRequest.transactionType ?? 'DEPOSIT',
        channel: transactionRequest.channel ?? 'BRANCH',
        amount: transactionRequest.amount ?? 0,
        remarks: transactionRequest.remarks ?? ''
      }
    };

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.cashierTxService.create(this.request).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.success.set(`Cashier transaction created! ID: ${res.id}`);
        setTimeout(() => this.router.navigate(['/cashier-transactions']), 1500);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}
