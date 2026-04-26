import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, User } from './auth.service';
import { ChatService, ChatResponse } from './chat.service';
import { StorageService } from './storage.service';

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
    { name: 'cyan', label: 'Cyan' },
    { name: 'amber', label: 'Amber' },
    { name: 'green', label: 'Green' },
    { name: 'magenta', label: 'Magenta' },
    { name: 'lavender', label: 'Lavender' },
    { name: 'silver', label: 'Silver' },
  ];

  currentUser: User | null = null;
  showAuthForm = false;
  isLoginMode = true;
  authError: string | null = null;
  isLoading = false;

  aiPrompt = '';
  aiReply = '';
  aiError: string | null = null;
  aiLoading = false;

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

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('activeTheme');
    if (savedTheme) {
      this.activeTheme = savedTheme;
    }

    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user?.accentColor) {
        this.activeTheme = user.accentColor;
        localStorage.setItem('activeTheme', user.accentColor);
      }
    });
  }

  setTheme(theme: string): void {
    this.activeTheme = theme;
    localStorage.setItem('activeTheme', theme);

    if (this.currentUser) {
      this.authService.updateAccentColor(theme).subscribe({
        next: (user: User) => {
          this.currentUser = user;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to save accent color', err);
        }
      });
    }
  }

  selectStory(storyPath: string): void {
    this.storageService.saveSelectedStory(storyPath);
  }

  toggleAuthForm(): void {
    this.showAuthForm = !this.showAuthForm;
    this.authError = null;

    if (!this.showAuthForm) {
      this.resetForms();
    }
  }

  switchMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authError = null;
    this.resetForms();
  }

  async onLogin(): Promise<void> {
    if (!this.loginData.email || !this.loginData.password) {
      this.authError = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.authError = null;

    try {
      await this.authService.login(
        this.loginData.email,
        this.loginData.password
      ).toPromise();

      this.showAuthForm = false;
      this.resetForms();
    } catch (error: unknown) {
      const err = error as HttpErrorResponse;
      console.error('Login error:', err);
      this.authError = err.error?.message || 'Login failed';
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister(): Promise<void> {
    if (
      !this.registerData.username ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {
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
      await this.authService.register(
        this.registerData.username,
        this.registerData.email,
        this.registerData.password
      ).toPromise();

      this.showAuthForm = false;
      this.resetForms();
    } catch (error: unknown) {
      const err = error as HttpErrorResponse;
      console.error('Registration error:', err);
      this.authError = err.error?.message || 'Registration failed';
    } finally {
      this.isLoading = false;
    }
  }

  onLogout(): void {
    this.authService.logout();
  }

  sendAiMessage(): void {
    if (!this.aiPrompt.trim()) {
      this.aiError = 'Please enter a message.';
      return;
    }

    this.aiLoading = true;
    this.aiError = null;
    this.aiReply = '';

    this.chatService.sendMessage(this.aiPrompt).subscribe({
      next: (res: ChatResponse) => {
        this.aiReply = res.reply;
        this.aiLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('AI request failed:', err);
        this.aiError = err.error?.error || 'Failed to get AI response.';
        this.aiLoading = false;
      }
    });
  }

  private resetForms(): void {
    this.loginData = { email: '', password: '' };
    this.registerData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }
}