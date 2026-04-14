import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  activeTheme = 'cyan';

  themes = [
    { name: 'cyan',     label: 'Cyan'     },
    { name: 'amber',    label: 'Amber'    },
    { name: 'green',    label: 'Green'    },
    { name: 'magenta',  label: 'Magenta'  },
    { name: 'lavender', label: 'Lavender' },
    { name: 'silver',   label: 'Silver'   },
  ];

  // Auth properties
  currentUser: User | null = null;
  showAuthForm = false;
  isLoginMode = true;
  authError: string | null = null;
  isLoading = false;

  // Form data
  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('activeTheme');
    if (savedTheme) {
      this.activeTheme = savedTheme;
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.accentColor) {
        this.activeTheme = user.accentColor;
        localStorage.setItem('activeTheme', user.accentColor);
      }
    });
  }

  setTheme(theme: string) {
    this.activeTheme = theme;
    localStorage.setItem('activeTheme', theme);

    if (this.currentUser) {
      this.authService.updateAccentColor(theme).subscribe({
        next: user => {
          this.currentUser = user;
        },
        error: err => {
          console.error('Failed to save accent color', err);
        }
      });
    }
  }

  toggleAuthForm() {
    this.showAuthForm = !this.showAuthForm;
    this.authError = null;
    if (!this.showAuthForm) {
      this.resetForms();
    }
  }

  switchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authError = null;
    this.resetForms();
  }

  async onLogin() {
    console.log('onLogin called with:', this.loginData);
    if (!this.loginData.email || !this.loginData.password) {
      this.authError = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.authError = null;

    try {
      console.log('Sending login request...');
      await this.authService.login(this.loginData.email, this.loginData.password).toPromise();
      console.log('Login successful');
      this.showAuthForm = false;
      this.resetForms();
    } catch (error: any) {
      console.error('Login error:', error);
      this.authError = error.error?.message || 'Login failed';
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister() {
    console.log('onRegister called with:', this.registerData);
    if (!this.registerData.username || !this.registerData.email ||
        !this.registerData.password || !this.registerData.confirmPassword) {
      this.authError = 'Please fill in all fields';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.authError = 'Passwords do not match';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.authError = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.authError = null;

    try {
      console.log('Sending register request...');
      await this.authService.register(
        this.registerData.username,
        this.registerData.email,
        this.registerData.password
      ).toPromise();
      console.log('Registration successful');
      console.log('Setting showAuthForm to false');
      this.showAuthForm = false;
      console.log('Calling resetForms');
      this.resetForms();
      console.log('Register completed');
    } catch (error: any) {
      console.error('Registration error:', error);
      this.authError = error.error?.message || 'Registration failed';
    } finally {
      console.log('Register finally: Setting isLoading to false');
      this.isLoading = false;
    }
  }

  onLogout() {
    this.authService.logout();
  }

  private resetForms() {
    this.loginData = { email: '', password: '' };
    this.registerData = { username: '', email: '', password: '', confirmPassword: '' };
  }
}