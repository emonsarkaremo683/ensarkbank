import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BranchService } from '../../services';
import { Branch } from '../../models';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './branch-list.html',
  styleUrl: './branch-list.scss'
})
export class BranchList implements OnInit {
  private branchService = inject(BranchService);
  branches = signal<Branch[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading.set(true);
    this.branchService.getAll().subscribe({
      next: (data) => { this.branches.set(data); this.loading.set(false); },
      error: (err) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  deleteBranch(id: number) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.branchService.delete(id).subscribe({
        next: () => this.loadBranches(),
        error: (err) => this.error.set(err.message)
      });
    }
  }
}
