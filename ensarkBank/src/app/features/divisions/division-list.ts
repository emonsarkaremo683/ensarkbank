import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../services';
import { Division } from '../../models';

@Component({
  selector: 'app-division-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './division-list.html',
  styleUrl: './division-list.scss'
})
export class DivisionList implements OnInit {
  private addressService = inject(AddressService);
  divisions = signal<Division[]>([]);
  loading = signal(true);
  error = signal('');
  newDivisionName = signal('');

  ngOnInit() {
    this.loadDivisions();
  }

  loadDivisions() {
    this.loading.set(true);
    this.addressService.getAllDivisions().subscribe({
      next: (data) => { this.divisions.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  addDivision() {
    const name = this.newDivisionName().trim();
    if (!name) return;
    this.addressService.createDivision({ name }).subscribe({
      next: () => { this.newDivisionName.set(''); this.loadDivisions(); },
      error: (err) => this.error.set(err.message)
    });
  }

  deleteDivision(id: number) {
    if (confirm('Delete this division?')) {
      this.addressService.deleteDivision(id).subscribe({
        next: () => this.loadDivisions(),
        error: (err) => this.error.set(err.message)
      });
    }
  }
}
