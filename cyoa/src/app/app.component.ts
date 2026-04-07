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

  activeTheme = 'cyan';

  themes = [
    { name: 'cyan',     label: 'Cyan'     },
    { name: 'amber',    label: 'Amber'    },
    { name: 'green',    label: 'Green'    },
    { name: 'magenta',  label: 'Magenta'  },
    { name: 'lavender', label: 'Lavender' },
    { name: 'silver',   label: 'Silver'   },
  ];

  setTheme(theme: string) {
    this.activeTheme = theme;
  }

}