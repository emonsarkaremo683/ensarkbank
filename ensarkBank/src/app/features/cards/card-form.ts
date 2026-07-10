import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardService } from '../../services';
import { AccountService } from '../../services';
import { CardRequest, AccountResponse } from '../../models';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './card-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './card-form.scss',
})
export class CardForm implements OnInit {
  private cardService = inject(CardService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  card: CardRequest = {
    accountId: 0,
    cardNetwork: 'VISA',
    cardType: 'DEBIT',
    pin: '',
    dailyLimit: 50000,
    monthlyLimit: 500000,
  };

  accounts = signal<AccountResponse[]>([]);
  loading = signal(false);
  error = signal('');

  networks = ['VISA', 'MASTERCARD'];
  cardTypes = ['DEBIT', 'CREDIT'];

  ngOnInit() {
    this.accountService.getAll().subscribe({ next: (data) => this.accounts.set(data) });
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    // ensure accountId is numeric and valid
    this.card.accountId = Number(this.card.accountId as any);
    if (!this.card.accountId || Number.isNaN(this.card.accountId)) {
      this.error.set('Please select a valid account');
      this.loading.set(false);
      return;
    }

    console.log('Card payload:', JSON.stringify(this.card));
    this.cardService.create(this.card).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/cards']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
