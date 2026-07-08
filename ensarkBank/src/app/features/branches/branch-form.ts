import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../services';
import { AddressService } from '../../services';
import { Branch, PoliceStation } from '../../models';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.scss'
})
export class BranchForm implements OnInit {
  private branchService = inject(BranchService);
  private addressService = inject(AddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  branch: Branch = {
    name: '',
    address: '',
    email: '',
    phoneNumber: '',
    type: 'BRANCH',
    status: 'ACTIVE',
    policeStation: undefined
  };

  policeStations = signal<PoliceStation[]>([]);
  branches = signal<Branch[]>([]);
  loading = signal(false);
  error = signal('');
  isEdit = signal(false);
  branchId = signal<number | null>(null);

  branchTypes = ['HEAD_OFFICE', 'BRANCH', 'AGENT_BANK'];
  branchStatuses = ['ACTIVE', 'CLOSED'];

  ngOnInit() {
    this.addressService.getAllPoliceStations().subscribe({
      next: (data) => this.policeStations.set(data),
      error: () => {}
    });
    this.branchService.getAll().subscribe({
      next: (data) => this.branches.set(data),
      error: () => {}
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.branchId.set(+id);
      this.branchService.getById(+id).subscribe({
        next: (data) => this.branch = data,
        error: (err) => this.error.set(err.message)
      });
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    const obs = this.isEdit()
      ? this.branchService.update(this.branchId()!, this.branch)
      : this.branchService.create(this.branch);
    obs.subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/branches']); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
