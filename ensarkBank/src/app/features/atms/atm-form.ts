import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AtmService, BranchService } from '../../services';
import { ATMRequest, Branch, ATMStatus } from '../../models';

@Component({
  selector: 'app-atm-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './atm-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './atm-form.scss',
})
export class AtmForm implements OnInit {
  private atmService = inject(AtmService);
  private branchService = inject(BranchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  atm: ATMRequest = {
    status: 'ACTIVE',
    balance: 0,
    limit: 0,
    address: '',
    branchId: 0,
  };

  branches = signal<Branch[]>([]);
  loading = signal(false);
  error = signal('');
  isEdit = signal(false);
  atmId = signal<number | null>(null);

  statuses: ATMStatus[] = ['ACTIVE', 'OFFLINE', 'OUT_OF_SERVICE', 'MAINTENANCE'];

  ngOnInit() {
    this.branchService.getAll().subscribe({
      next: (data) => this.branches.set(data),
      error: () => {},
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.atmId.set(+id);
      this.atmService.getById(+id).subscribe({
        next: (data) => {
          this.atm.address = data.address;
          this.atm.limit = data.limit;
          this.atm.status = data.status;
          this.atm.branchId = 0;
          this.atm.balance = data.availableBalance;
        },
        error: (err) => this.error.set(err.message),
      });
    }
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');
    const obs = this.isEdit()
      ? this.atmService.update(this.atmId()!, this.atm)
      : this.atmService.create(this.atm);
    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/atms']);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
