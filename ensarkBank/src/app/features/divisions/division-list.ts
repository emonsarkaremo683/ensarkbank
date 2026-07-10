import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AddressService } from '../../services';
import { District, Division } from '../../models';

@Component({
  selector: 'app-division-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './division-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./division-list.scss'],
})
export class DivisionList implements OnInit {
  private addressService = inject(AddressService);
  divisions = signal<Division[]>([]);
  districts = signal<District[]>([]);
  loading = signal(true);
  error = signal('');
  newDivisionName = signal('');

  ngOnInit() {
    this.loadDivisions();
  }

  loadDivisions() {
    this.loading.set(true);
    forkJoin({
      divisions: this.addressService.getAllDivisions(),
      districts: this.addressService.getAllDistricts(),
    }).subscribe({
      next: ({ divisions, districts }) => {
        this.divisions.set(divisions);
        this.districts.set(districts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  getDistrictByDivisionId(id?: number) {
    if (!id) return [];
    return this.districts().filter((d) => d.division?.id === id);
  }

  addDivision() {
    const name = this.newDivisionName().trim();
    if (!name) return;
    this.addressService.createDivision({ name }).subscribe({
      next: () => {
        this.newDivisionName.set('');
        this.loadDivisions();
      },
      error: (err) => this.error.set(err.message),
    });
  }

  deleteDivision(id: number) {
    if (confirm('Delete this division?')) {
      this.addressService.deleteDivision(id).subscribe({
        next: () => this.loadDivisions(),
        error: (err) => this.error.set(err.message),
      });
    }
  }
}
