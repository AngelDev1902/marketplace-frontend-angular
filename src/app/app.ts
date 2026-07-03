import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  imports: [RouterOutlet],
})
export class App implements OnInit {
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {}
}
