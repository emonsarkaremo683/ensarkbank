import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AddressService } from '../../services';
import { District, Division, PoliceStation } from '../../models';

@Component({
  selector: 'app-district-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './district-list.html',
  styleUrls: ['./district-list.scss']
})
export class DistrictList implements OnInit {
  private addressService = inject(AddressService);
  districts = signal<District[]>([]);
  divisions = signal<Division[]>([]);
  policeStations = signal<PoliceStation[]>([]);
  loading = signal(true);
  error = signal('');

  newDistrict: District = { name: '', division: { id: 0 } };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      districts: this.addressService.getAllDistricts(),
      divisions: this.addressService.getAllDivisions(),
      policeStations: this.addressService.getAllPoliceStations()
    }).subscribe({
      next: ({ districts, divisions, policeStations }) => {
        this.districts.set(districts);
        this.divisions.set(divisions);
        this.policeStations.set(policeStations);
        this.loading.set(false);
      },
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

  getPoliceStationsByDistrictId(districtId?: number) {
    if (!districtId) return [];
    return this.policeStations().filter(ps => ps.district?.id === districtId);
  }
}
