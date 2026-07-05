import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { CardService } from '../../services';
import { CardResponse } from '../../models';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [RouterLink, DatePipe, CommonModule],
  templateUrl: './card-list.html',
  styleUrls: ['./card-list.scss']
})
export class CardList implements OnInit {
  private cardService = inject(CardService);
  cards = signal<CardResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.loading.set(true);
    this.cardService.getAll().subscribe({
      next: (data) => { this.cards.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  maskCardNumber(number: string): string {
    if (!number) return '';
    return number.replace(/(.{4})/g, '$1 ').trim();
  }

  trackByCardId(_index: number, card: CardResponse) {
    return card?.cardId;
  }

  getBarPattern(cardNumber?: string): number[] {
    const seed = (cardNumber || '').replace(/\D/g, '') || '0';
    return Array.from(seed).map((ch, i) => ((ch.charCodeAt(0) + i) % 8) + 2);
  }

  getNumberBarPattern(cardNumber?: string): number[] {
    const seed = (cardNumber || '').replace(/\D/g, '') || '0';
    return Array.from(seed).map((ch, i) => ((ch.charCodeAt(0) + i * 2) % 10) + 4);
  }
}
