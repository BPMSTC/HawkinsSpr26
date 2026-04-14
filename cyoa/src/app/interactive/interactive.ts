import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { StoryService } from './story.service';
import { Scene, StoryMeta, HistoryEntry } from './story.model';
import { AuthService } from '../auth.service';

export type ThemeName = 'cyan' | 'amber' | 'green' | 'magenta' | 'lavender' | 'silver';
export interface ThemeSwatch { name: ThemeName; label: string; }

@Component({
  selector: 'app-interactive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interactive.html',
  styleUrl: './interactive.scss',
})
export class InteractiveComponent implements OnInit, OnDestroy {
  @ViewChild('historyPanel') historyPanel!: ElementRef<HTMLDivElement>;

  meta: StoryMeta | null = null;
  currentScene: Scene | null = null;
  history: HistoryEntry[] = [];
  error: string | null = null;
  loading = true;
  isHistoryCollapsed = false;
  animatingIn = false;
  activeTheme: ThemeName = 'cyan';
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

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const storyPath = params.get('storyPath');
        if (storyPath) {
          this.storyId = storyPath;
          this.loadStoryWithProgress(storyPath);
        } else {
          this.error = 'No story was selected. Please return to the home page and choose a story.';
          this.loading = false;
          this.cdr.detectChanges();
        }
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
    if (this.authService.isLoggedIn()) {
      this.authService.saveProgress(this.storyId, '', []).subscribe({
        next: () => console.log('Progress cleared'),
        error: (err) => console.error('Failed to clear progress:', err)
      });
    }
  }

  private async loadStoryWithProgress(storyPath: string): Promise<void> {
    let startSceneId: string | undefined;
    let initialHistory: HistoryEntry[] = [];

    // If user is logged in, try to load their progress
    if (this.authService.isLoggedIn()) {
      try {
        const progress = await this.authService.loadProgress(this.storyId).toPromise();
        if (progress && progress.currentScene) {
          startSceneId = progress.currentScene;
          // Convert history strings back to HistoryEntry objects
          initialHistory = progress.history.map(choiceText => ({
            sceneTitle: 'Previous Scene',
            sceneNarrative: 'Continued from saved progress...',
            choiceMade: choiceText
          }));
        }
      } catch (error) {
        // Network error or invalid token - just start fresh, don't show error to user
        console.log('Could not load saved progress, starting fresh:', error);
      }
    }

    // Load the story with progress (story service will handle invalid scenes gracefully)
    this.storyService.loadStory(storyPath, startSceneId, initialHistory);
  }

  private saveProgress(): void {
    if (!this.authService.isLoggedIn() || !this.currentScene || !this.storyId) return;

    const historyStrings = this.history.map(entry => entry.choiceMade);

    this.authService.saveProgress(
      this.storyId,
      this.currentScene.id,
      historyStrings
    ).subscribe({
      next: () => console.log('Progress saved'),
      error: (err) => {
        // Silently handle save errors - don't disrupt user experience
        console.warn('Failed to save progress (continuing):', err);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  setTheme(theme: ThemeName): void {
    this.activeTheme = theme;
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
