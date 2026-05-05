import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { StoryService } from './story.service';
import { Scene, StoryMeta, HistoryEntry } from './story.model';
import { AuthService, User } from '../auth.service';
import { StorageService } from '../storage.service';

export type ThemeName = 'cyan' | 'amber' | 'green' | 'magenta' | 'lavender' | 'silver';
export interface ThemeSwatch { name: ThemeName; label: string; }

@Component({
  selector: 'app-interactive',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './interactive.html',
  styleUrl: './interactive.scss',
})
export class InteractiveComponent implements OnInit, OnDestroy {
  @ViewChild('historyPanel') historyPanel!: ElementRef<HTMLDivElement>;

  meta: StoryMeta | null = null;
  currentScene: Scene | null = null;
  history: HistoryEntry[] = [];
  currentUser: User | null = null;
  showAuthForm = false;
  isLoginMode = true;
  authError: string | null = null;
  isLoading = false;

  error: string | null = null;
  loading = true;
  selectedStoryPath: string | null = null;
  isHistoryCollapsed = false;
  animatingIn = false;
  storyId: string = '';

  themes: ThemeSwatch[] = [
    { name: 'cyan',     label: 'Cyan'     },
    { name: 'amber',    label: 'Amber'    },
    { name: 'green',    label: 'Green'    },
    { name: 'magenta',  label: 'Magenta'  },
    { name: 'lavender', label: 'Lavender' },
    { name: 'silver',   label: 'Silver'   },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private storyService: StoryService,
    private authService: AuthService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.storyService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => { this.loading = loading; this.cdr.detectChanges(); });

    this.storyService.meta$
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => { this.meta = meta; this.cdr.detectChanges(); });

    this.storyService.currentScene$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scene => {
        this.animatingIn = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.currentScene = scene;
          this.animatingIn = true;
          this.cdr.detectChanges();
          // Save progress when scene changes
          this.saveProgress();
        }, 50);
      });

    this.storyService.history$
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.history = history;
        this.cdr.detectChanges();
        setTimeout(() => this.scrollHistoryToBottom(), 80);
      });

    this.storyService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(err => { this.error = err; this.cdr.detectChanges(); });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.cdr.detectChanges();
      });

    this.route.paramMap
  .pipe(takeUntil(this.destroy$))
  .subscribe(params => {
    const storyPath = params.get('storyPath');

    this.selectedStoryPath = storyPath;

    if (!storyPath) {
      this.storyId = '';
      this.currentScene = null;
      this.history = [];
      this.error = null;
      this.loading = false;
      this.meta = null;
      this.cdr.detectChanges();
      return;
    }

    this.storyId = storyPath;

    this.storageService.saveSelectedStory(storyPath);
    this.loadStoryWithProgress(storyPath);
  });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  makeChoice(choiceId: string): void {
    this.animatingIn = false;
    setTimeout(() => this.storyService.makeChoice(choiceId), 200);
  }

  restart(): void {
    this.storyService.restart();
    // Clear saved progress when restarting
    this.storageService.clearProgress(this.storyId);
    
    if (this.authService.isLoggedIn()) {
      this.authService.saveProgress(this.storyId, '', []).subscribe({
        next: () => console.log('Progress cleared'),
        error: (err: any) => {
          // Silently handle errors - don't disrupt restart
          console.log('Could not clear backend progress (continuing)');
        }
      });
    }
  }

  private async loadStoryWithProgress(storyPath: string): Promise<void> {
    let startSceneId: string | undefined;
    let initialHistory: HistoryEntry[] = [];

    // First, try to load progress from localStorage (works for both logged in and offline)
    const localProgress = this.storageService.loadProgress(this.storyId);
    if (localProgress && localProgress.currentScene) {
      startSceneId = localProgress.currentScene;
      initialHistory = localProgress.history.map(choiceText => ({
        sceneTitle: 'Previous Scene',
        sceneNarrative: 'Continued from saved progress...',
        choiceMade: choiceText
      }));
    }

    // If logged in, also check backend for potentially more recent progress
    if (this.authService.isLoggedIn()) {
      try {
        const backendProgress = await this.authService.loadProgress(this.storyId).toPromise();
        if (backendProgress && backendProgress.currentScene) {
          // Prefer backend progress if it exists and is more recent
          startSceneId = backendProgress.currentScene;
          if (backendProgress.history && Array.isArray(backendProgress.history)) {
            initialHistory = backendProgress.history.map(choiceText => ({
              sceneTitle: 'Previous Scene',
              sceneNarrative: 'Continued from saved progress...',
              choiceMade: choiceText
            }));
          }
        }
      } catch (error: any) {
        // Handle 401 unauthorized - token is invalid or expired
        if (error?.status === 401) {
          console.log('Session expired, logging out');
          this.authService.logout();
        }
        // Network error or other issues - just use local progress, don't show error to user
        console.log('Could not load backend progress, using local progress');
      }
    }

    // Load the story with progress (story service will handle invalid scenes gracefully)
    this.storyService.loadStory(storyPath, startSceneId, initialHistory);
  }

  private saveProgress(): void {
    if (!this.currentScene || !this.storyId) return;

    const historyStrings = this.history.map(entry => entry.choiceMade);

    // Always save to localStorage for immediate offline access
    this.storageService.saveProgress(this.storyId, this.currentScene.id, historyStrings);

    // Also save to backend if logged in
    if (this.authService.isLoggedIn()) {
      this.authService.saveProgress(
        this.storyId,
        this.currentScene.id,
        historyStrings
      ).subscribe({
        next: () => console.log('Progress saved to backend'),
        error: (err: any) => {
          // Handle 401 unauthorized - token is invalid or expired
          if (err?.status === 401) {
            console.log('Session expired, logging out');
            this.authService.logout();
          }
          // Silently handle save errors - local progress is already saved
          console.log('Background save to backend skipped (local save preserved)');
        }
      });
    }
  }

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

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
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

  private resetForms(): void {
    this.loginData = {
      email: '',
      password: ''
    };

    this.registerData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  toggleHistory(): void {
    this.isHistoryCollapsed = !this.isHistoryCollapsed;
  }

  private scrollHistoryToBottom(): void {
    if (this.historyPanel) {
      this.historyPanel.nativeElement.scrollTop = this.historyPanel.nativeElement.scrollHeight;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
