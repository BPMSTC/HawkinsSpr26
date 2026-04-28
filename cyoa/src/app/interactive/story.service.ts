import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Scene, StoryMeta, StoryData, HistoryEntry } from './story.model';

@Injectable({ providedIn: 'root' })
export class StoryService {
  private scenesMap = new Map<string, Scene>();

  private metaSubject         = new BehaviorSubject<StoryMeta | null>(null);
  private currentSceneSubject = new BehaviorSubject<Scene | null>(null);
  private historySubject      = new BehaviorSubject<HistoryEntry[]>([]);
  private errorSubject        = new BehaviorSubject<string | null>(null);
  private loadingSubject      = new BehaviorSubject<boolean>(true);

  meta$         = this.metaSubject.asObservable();
  currentScene$ = this.currentSceneSubject.asObservable();
  history$      = this.historySubject.asObservable();
  error$        = this.errorSubject.asObservable();
  loading$      = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadStory(storyPath: string, startSceneId?: string, initialHistory: HistoryEntry[] = []): void {
    this.historySubject.next(initialHistory);
    this.metaSubject.next(null);
    this.currentSceneSubject.next(null);
    this.errorSubject.next(null);
    // Normalize path for loading from public folder
    // Files are served at root level (/HuntingStory.json, /IceStory.json, etc)
    let filePath = storyPath;
    // Remove any path prefixes that might be added
    if (filePath.startsWith('/public/')) {
      filePath = filePath.substring(8); // Remove '/public/'
    } else if (filePath.startsWith('public/')) {
      filePath = filePath.substring(7); // Remove 'public/'
    }
    if (filePath.startsWith('./')) {
      filePath = filePath.substring(2); // Remove './'
    }
    if (filePath.startsWith('/')) {
      filePath = filePath.substring(1); // Remove leading /
    }
    // Use absolute path from app root
    filePath = `/${filePath}`;
    this.loadStoryData(filePath, startSceneId);
  }

  private loadStoryData(filePath: string, startSceneId?: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    console.log('Loading story from path:', filePath);

    this.http.get<StoryData>(filePath).subscribe({
      next: (data) => {
        if (!data?.meta) {
          this.errorSubject.next('The story data is missing its meta block. Please check story.json.');
          this.loadingSubject.next(false);
          return;
        }
        if (!data?.scenes?.length) {
          this.errorSubject.next('The story data could not be loaded. The file appears to be empty or malformed.');
          this.loadingSubject.next(false);
          return;
        }
        this.scenesMap = new Map(data.scenes.map(s => [s.id, s]));
        this.metaSubject.next(data.meta);
        this.loadingSubject.next(false);
        this.navigateTo(startSceneId || data.meta.startSceneId);
      },
      error: (err) => {
        console.error('Failed to load story from:', filePath, err);
        this.errorSubject.next('The story data could not be loaded. Please check that story.json is present and try refreshing.');
        this.loadingSubject.next(false);
      }
    });
  }

  private navigateTo(id: string): void {
    const scene = this.scenesMap.get(id);
    if (!scene) {
      console.warn(`Scene "${id}" could not be found. Falling back to start scene.`);
      // Try to find the start scene from meta
      const meta = this.metaSubject.value;
      if (meta?.startSceneId) {
        const startScene = this.scenesMap.get(meta.startSceneId);
        if (startScene) {
          this.errorSubject.next(null);
          this.currentSceneSubject.next(startScene);
          return;
        }
      }
      // If we can't find start scene either, show error
      this.errorSubject.next(`Scene "${id}" could not be found and no valid start scene available.`);
      return;
    }
    this.errorSubject.next(null);
    this.currentSceneSubject.next(scene);
  }

  makeChoice(choiceId: string): void {
    const current = this.currentSceneSubject.value;
    if (!current) return;

    const choice = current.choices.find(c => c.id === choiceId);
    if (!choice) {
      this.errorSubject.next('That choice is no longer available. Please refresh to restart.');
      return;
    }

    const entry: HistoryEntry = {
      sceneTitle:     current.title,
      sceneNarrative: current.narrative,
      choiceMade:     choice.text,
    };

    this.historySubject.next([...this.historySubject.value, entry]);
    this.navigateTo(choice.nextSceneId);
  }

  restart(): void {
    const meta = this.metaSubject.value;
    this.historySubject.next([]);
    this.errorSubject.next(null);
    if (meta) this.navigateTo(meta.startSceneId);
  }
}
