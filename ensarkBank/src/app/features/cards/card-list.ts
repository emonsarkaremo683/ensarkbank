import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CardService } from '../../services';
import { CardResponse } from '../../models';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './card-list.html',
  styleUrl: './card-list.scss'
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
}
