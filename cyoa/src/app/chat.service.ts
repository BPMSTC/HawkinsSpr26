import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ChatResponse {
  reply: string;
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
    // Step 1: Define the API endpoint URL as a constant
    const apiUrl = 'http://localhost:3000/api/openai/chat';
    
    // Step 2: Create the request payload object with the message
    const requestPayload = { message };
    
    // Step 3: Specify the expected response type (ChatResponse)
    const responseType = 'ChatResponse';
    
    // Step 4: Get a reference to the HttpClient instance
    const httpClient = this.http;
    
    // Step 5: Call the post method with URL, payload, and type
    const httpCall = httpClient.post<ChatResponse>(
      apiUrl,
      requestPayload
    );
    
    // Step 6: Return the Observable from the HTTP call
    return httpCall;
  }
}