import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

// Interface chuẩn cho dữ liệu trả về từ AI
export interface AiResponse {
  success: boolean;
  data:
    | {
        text: string;
        links?: Array<{
          id: string | number;
          title: string;
          url: string;
        }>;
        originalText?: string;
      }
    | string; // Tương thích cả string và object
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = `${API_BASE_URL}/ai/consult`;

  constructor(private http: HttpClient) {}

  // Gửi tin nhắn và nhận phản hồi
  sendMessage(message: string, history: any[] = []) {
    return this.http.post<AiResponse>(this.apiUrl, { message, history });
  }
}
