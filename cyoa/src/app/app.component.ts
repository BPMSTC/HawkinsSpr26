import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, User } from './auth.service';
import { ChatService, ChatResponse } from './chat.service';

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
    private chatService: ChatService
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
    // Check if the AI prompt is empty or only whitespace
    if (!this.aiPrompt.trim()) {
      // Set the error message for empty prompt
      this.aiError = 'Please enter a message.';
      // Exit the function early
      return;
    }

    // Set the loading state to true to show spinner or loading indicator
    this.aiLoading = true;
    // Clear any previous error messages
    this.aiError = null;
    // Clear any previous AI reply
    this.aiReply = '';

    // Call the chat service to send the message
    // This returns an Observable, and we subscribe to handle the response
    this.chatService.sendMessage(this.aiPrompt).subscribe({
      // Handle successful response
      next: (res: ChatResponse) => {
        // Extract the reply from the response object
        this.aiReply = res.reply;
        // Set loading state to false to hide spinner
        this.aiLoading = false;
      },
      // Handle error response
      error: (err: HttpErrorResponse) => {
        // Log the error to the console for debugging
        console.error('AI request failed:', err);
        // Set the error message, using the error from response or a default message
        this.aiError = err.error?.error || 'Failed to get AI response.';
        // Set loading state to false to hide spinner
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