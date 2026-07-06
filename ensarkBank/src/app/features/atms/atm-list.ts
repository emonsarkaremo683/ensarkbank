import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { AtmService } from '../../services';
import { ATMResponse } from '../../models';

@Component({
  selector: 'app-atm-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './atm-list.html',
  styleUrl: './atm-list.scss'
})
export class AtmList implements OnInit {
  private atmService = inject(AtmService);
  atms = signal<ATMResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadAtms();
  }

  loadAtms() {
    this.loading.set(true);
    this.error.set('');
    this.atmService.getAll().subscribe({
      next: (data) => { this.atms.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'badge-green';
      case 'OFFLINE': return 'badge-yellow';
      case 'MAINTENANCE': return 'badge-blue';
      case 'OUT_OF_SERVICE': return 'badge-red';
      default: return 'badge-light';
    }
  }
}
