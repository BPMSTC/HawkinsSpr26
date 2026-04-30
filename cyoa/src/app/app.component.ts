import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

type ThemeName = 'cyan' | 'amber' | 'green' | 'magenta' | 'lavender' | 'silver';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  activeTheme: ThemeName =
    (localStorage.getItem('activeTheme') as ThemeName) || 'cyan';

  themes: { name: ThemeName; label: string }[] = [
    { name: 'cyan', label: 'Cyan' },
    { name: 'amber', label: 'Amber' },
    { name: 'green', label: 'Green' },
    { name: 'magenta', label: 'Magenta' },
    { name: 'lavender', label: 'Lavender' },
    { name: 'silver', label: 'Silver' }
  ];

  setTheme(theme: ThemeName): void {
    this.activeTheme = theme;
    localStorage.setItem('activeTheme', theme);
  }
}