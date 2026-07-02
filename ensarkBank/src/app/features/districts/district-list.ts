import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../services';
import { District, Division } from '../../models';

@Component({
  selector: 'app-district-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './district-list.html',
  styleUrl: './district-list.scss'
})
export class DistrictList implements OnInit {
  private addressService = inject(AddressService);
  districts = signal<District[]>([]);
  divisions = signal<Division[]>([]);
  loading = signal(true);
  error = signal('');

  newDistrict: District = { name: '', division: { id: 0 } };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.addressService.getAllDistricts().subscribe({ next: (data) => this.districts.set(data) });
    this.addressService.getAllDivisions().subscribe({
      next: (data) => { this.divisions.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  addDistrict() {
    if (!this.newDistrict.name || !this.newDistrict.division?.id) return;
    this.addressService.createDistrict(this.newDistrict).subscribe({
      next: () => { this.newDistrict = { name: '', division: { id: 0 } }; this.loadData(); },
      error: (err) => this.error.set(err.message)
    });
  }

  deleteDistrict(id: number) {
    if (confirm('Delete this district?')) {
      this.addressService.deleteDistrict(id).subscribe({
        next: () => this.loadData(),
        error: (err) => this.error.set(err.message)
      });
    }
  }
}
