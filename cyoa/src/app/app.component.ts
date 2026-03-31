import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  activeTheme = 'ember';

  themes = [
    { name: 'ember', label: 'Ember' },
    { name: 'forest', label: 'Forest' },
    { name: 'arcane', label: 'Arcane' }
  ];

  setTheme(theme: string) {
    this.activeTheme = theme;
  }

}