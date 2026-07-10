import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/layout/sidebar';
import { ToastComponent } from './shared/toast/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, ToastComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App {
  private authService = inject(AuthService);
  protected isLoggedIn = this.authService.isLoggedIn;
}
