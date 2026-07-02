import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../services';
import { PoliceStation, District } from '../../models';

@Component({
  selector: 'app-police-station-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './police-station-list.html',
  styleUrl: './police-station-list.scss'
})
export class PoliceStationList implements OnInit {
  private addressService = inject(AddressService);
  policeStations = signal<PoliceStation[]>([]);
  districts = signal<District[]>([]);
  loading = signal(true);
  error = signal('');

  newPS: PoliceStation = { name: '', district: { id: 0 } };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.addressService.getAllPoliceStations().subscribe({ next: (data) => this.policeStations.set(data) });
    this.addressService.getAllDistricts().subscribe({
      next: (data) => { this.districts.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  addPS() {
    if (!this.newPS.name || !this.newPS.district?.id) return;
    this.addressService.createPoliceStation(this.newPS).subscribe({
      next: () => { this.newPS = { name: '', district: { id: 0 } }; this.loadData(); },
      error: (err) => this.error.set(err.message)
    });
  }

  deletePS(id: number) {
    if (confirm('Delete this police station?')) {
      this.addressService.deletePoliceStation(id).subscribe({
        next: () => this.loadData(),
        error: (err) => this.error.set(err.message)
      });
    }
  }
}
