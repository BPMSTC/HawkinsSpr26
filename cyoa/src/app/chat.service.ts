import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatResponse {
  reply: string;
  requestsUsed: number;
  requestsRemaining: number;
  dailyLimit: number;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http: HttpClient;

  constructor() {
    try {
      this.http = inject(HttpClient);

      if (this.http === undefined) {
        throw new Error('HttpClient injection returned undefined');
      }
    } catch (error) {
      console.error('Error during HttpClient injection:', error);
      throw error;
    }
  }

  sendMessage(message: string): Observable<ChatResponse> {
    const apiUrl = 'http://localhost:3000/api/openai/chat';

    return this.http.post<ChatResponse>(apiUrl, {
      message
    });
  }
}