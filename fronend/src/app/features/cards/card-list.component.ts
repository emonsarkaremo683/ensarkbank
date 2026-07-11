import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="page-header mb-0"><h1>Cards</h1><p>Manage debit and credit cards</p></div>
      <a routerLink="/cards/new" class="btn btn-primary">+ Issue Card</a>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Card Number</th><th>Holder</th><th>Type</th><th>Network</th><th>Status</th></tr></thead>
            <tbody>
              @if (cards().length === 0) {
                <tr><td colspan="5" class="text-center py-5 text-muted">No cards found</td></tr>
              } @else {
                @for (c of cards(); track c.cardId) {
                  <tr>
                    <td class="font-mono">•••• •••• •••• {{ c.cardNumber?.slice(-4) }}</td>
                    <td>{{ c.cardHolderName }}</td>
                    <td>{{ c.cardType }}</td>
                    <td>{{ c.cardNetwork }}</td>
                    <td><app-status-badge [status]="c.status" /></td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`.font-mono { font-size: 13px; }`]
})
export class CardListComponent implements OnInit {
  private http = inject(HttpClient);
  cards = signal<any[]>([]);
  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/card/`).subscribe({ next: (d) => this.cards.set(d) });
  }
}
