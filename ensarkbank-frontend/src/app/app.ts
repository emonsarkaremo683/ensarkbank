import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: '<app-toast-container /><router-outlet />',
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class App {}
