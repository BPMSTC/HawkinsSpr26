import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface StoryProgress {
  storyId: string;
  currentScene: string;
  history: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      username, email, password
    }).pipe(
      tap(response => this.setSession(response))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email, password
    }).pipe(
      tap(response => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Story progress methods
  saveProgress(storyId: string, currentScene: string, history: string[]): Observable<any> {
    const headers = { 'Authorization': `Bearer ${this.getToken()}` };
    return this.http.post(`${this.apiUrl}/progress`, {
      storyId, currentScene, history
    }, { headers });
  }

  loadProgress(storyId: string): Observable<{ currentScene: string | null; history: string[] }> {
    const headers = { 'Authorization': `Bearer ${this.getToken()}` };
    return this.http.get<{ currentScene: string | null; history: string[] }>(`${this.apiUrl}/progress/${storyId}`, { headers });
  }

  getAllProgress(): Observable<StoryProgress[]> {
    const headers = { 'Authorization': `Bearer ${this.getToken()}` };
    return this.http.get<StoryProgress[]>(`${this.apiUrl}/progress`, { headers });
  }
}