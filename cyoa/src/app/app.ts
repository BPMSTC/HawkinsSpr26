import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

type ThemeName = 'cyan' | 'amber' | 'green' | 'magenta' | 'lavender' | 'silver';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="app-shell" [ngClass]="'theme-' + activeTheme">
      <div class="theme-bar">
        <div class="nav-left">
          <div class="dropdown">
            <button class="dropbtn">☰</button>
            <div class="dropdown-content">
              <a [routerLink]="['/']">Home</a>
              <a [routerLink]="['/interactive']">Interactive</a>
            </div>
          </div>
        </div>

        <span class="theme-bar-label">Colour</span>

        <button
          *ngFor="let t of themes"
          class="theme-swatch"
          [ngClass]="['swatch-' + t.name, activeTheme === t.name ? 'active' : '']"
          (click)="setTheme(t.name)"
          [attr.title]="t.label">
        </button>
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: [],
})
export class App {
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
