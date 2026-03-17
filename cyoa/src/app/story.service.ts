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

  constructor(private http: HttpClient) {
    this.loadStoryData();
  }

  private loadStoryData(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<StoryData>('story.json').subscribe({
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
        this.navigateTo(data.meta.startSceneId);
      },
      error: () => {
        this.errorSubject.next('The story data could not be loaded. Please check that story.json is present and try refreshing.');
        this.loadingSubject.next(false);
      }
    });
  }

  private navigateTo(id: string): void {
    const scene = this.scenesMap.get(id);
    if (!scene) {
      const meta = this.metaSubject.value;
      this.errorSubject.next(`Scene "${id}" could not be found. The story cannot continue from this point.`);
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
