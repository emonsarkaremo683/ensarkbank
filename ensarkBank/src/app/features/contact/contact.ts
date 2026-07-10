import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './contact.scss',
})
export class Contact {}
