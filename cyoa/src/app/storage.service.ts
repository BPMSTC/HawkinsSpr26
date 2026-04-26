import { Injectable } from '@angular/core';

export interface StoredProgress {
  currentScene: string;
  history: string[];
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly SELECTED_STORY_KEY = 'selectedStory';
  private readonly PROGRESS_PREFIX = 'progress_';

  /**
   * Save the selected story to localStorage
   */
  saveSelectedStory(storyPath: string): void {
    localStorage.setItem(this.SELECTED_STORY_KEY, storyPath);
  }

  /**
   * Get the previously selected story from localStorage
   */
  getSelectedStory(): string | null {
    return localStorage.getItem(this.SELECTED_STORY_KEY);
  }

  /**
   * Clear the selected story from localStorage
   */
  clearSelectedStory(): void {
    localStorage.removeItem(this.SELECTED_STORY_KEY);
  }

  /**
   * Save story progress to localStorage
   */
  saveProgress(storyId: string, currentScene: string, history: string[]): void {
    const progress: StoredProgress = {
      currentScene,
      history,
      timestamp: Date.now()
    };
    localStorage.setItem(this.PROGRESS_PREFIX + storyId, JSON.stringify(progress));
  }

  /**
   * Load story progress from localStorage
   */
  loadProgress(storyId: string): StoredProgress | null {
    const stored = localStorage.getItem(this.PROGRESS_PREFIX + storyId);
    if (stored) {
      try {
        return JSON.parse(stored) as StoredProgress;
      } catch (e) {
        console.warn('Failed to parse stored progress:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear story progress from localStorage
   */
  clearProgress(storyId: string): void {
    localStorage.removeItem(this.PROGRESS_PREFIX + storyId);
  }
}
