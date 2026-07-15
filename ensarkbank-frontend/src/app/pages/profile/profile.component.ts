import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { CryptoService } from '../../core/services/crypto.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserInfo } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user = signal<UserInfo | null>(null);
  loading = signal(true);
  uploading = signal(false);
  profilePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private crypto: CryptoService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    const currentUser = this.auth.currentUser();
    if (!currentUser) {
      this.loading.set(false);
      return;
    }

    if (this.auth.isCustomer()) {
      this.api.getCustomerById(currentUser.id).subscribe({
        next: (data) => {
          const user = this.auth.currentUser();
          if (user && data.profile && !data.imageUrl) {
            data.imageUrl = `${environment.apiUrl}/uploads/customer/${data.profile}`;
          }
          this.user.set(data as any);
          this.loading.set(false);
        },
        error: () => {
          this.user.set(currentUser);
          this.loading.set(false);
        }
      });
    } else {
      this.api.getEmployeeById(currentUser.id).subscribe({
        next: (data) => {
          const user = this.auth.currentUser();
          if (user && data.profile && !data.imageUrl) {
            data.imageUrl = `${environment.apiUrl}/uploads/employee/${data.profile}`;
          }
          this.user.set(data as any);
          this.loading.set(false);
        },
        error: () => {
          this.user.set(currentUser);
          this.loading.set(false);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfile(): void {
    const file = this.selectedFile();
    const currentUser = this.user() || this.auth.currentUser();
    if (!file || !currentUser) return;

    this.uploading.set(true);
    const formData = new FormData();
    formData.append('profile', file);

    if (this.auth.isCustomer()) {
      this.api.updateCustomer(currentUser.id, formData).subscribe({
        next: (res: any) => {
          if (res.profile) {
            const imageUrl = `${environment.apiUrl}/uploads/customer/${res.profile}`;
            const updatedUser = { ...this.auth.currentUser(), profile: res.profile, imageUrl };
            localStorage.setItem('bank_user', this.crypto.encryptObject(updatedUser));
            this.auth.currentUser.set(updatedUser as any);
            this.user.set({ ...currentUser, profile: res.profile, imageUrl } as any);
          }
          this.notify.success('Success', 'Profile picture updated');
          this.profilePreview.set(null);
          this.selectedFile.set(null);
          this.uploading.set(false);
        },
        error: () => {
          this.notify.error('Error', 'Failed to upload profile picture');
          this.uploading.set(false);
        }
      });
    } else {
      this.api.updateEmployeeProfilePicture(currentUser.id, formData).subscribe({
        next: (res: any) => {
          if (res.profile) {
            const imageUrl = `${environment.apiUrl}/uploads/employee/${res.profile}`;
            const updatedUser = { ...this.auth.currentUser(), profile: res.profile, imageUrl };
            localStorage.setItem('bank_user', this.crypto.encryptObject(updatedUser));
            this.auth.currentUser.set(updatedUser as any);
            this.user.set({ ...currentUser, profile: res.profile, imageUrl } as any);
          }
          this.notify.success('Success', 'Profile picture updated');
          this.profilePreview.set(null);
          this.selectedFile.set(null);
          this.uploading.set(false);
        },
        error: () => {
          this.notify.error('Error', 'Failed to upload profile picture');
          this.uploading.set(false);
        }
      });
    }
  }

  getDisplayImage(): string {
    return this.profilePreview() || this.user()?.imageUrl || '';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
