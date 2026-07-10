import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './services.scss',
})
export class Services {}
