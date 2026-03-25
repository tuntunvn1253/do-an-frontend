import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService, AiResponse } from '../../../core/services/ai.service';

// 1. Cấu trúc tin nhắn
interface ChatMessage {
  role: string;
  text: string;
  links?: Array<{ title: string; url: string }>;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css'],
})
export class AiChatComponent {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  isOpen = signal(false);
  isLoading = signal(false);
  userMessage = '';

  // Tin nhắn chào mừng mặc định hiển thị trên UI
  messages: ChatMessage[] = [
    { role: 'ai', text: 'Chào bạn! Tôi là trợ lý CNC HUB. Tôi có thể giúp gì cho bạn?' },
  ];

  constructor(
    private aiService: AiService,
    private router: Router,
  ) {}

  toggleChat() {
    this.isOpen.update((v) => !v);
  }

  // Hàm xử lý Click vào Box sản phẩm
  openLink(url: string) {
    if (!url) return;

    let targetPath = url;
    if (url.includes('localhost:4200')) {
      targetPath = url.split('4200')[1] || '/';
    } else if (!url.startsWith('/')) {
      targetPath = '/' + url;
    }

    this.router.navigateByUrl(targetPath);
    this.isOpen.set(false);
  }

  async send() {
    if (!this.userMessage.trim() || this.isLoading()) return;

    const msg = this.userMessage;
    this.messages.push({ role: 'user', text: msg });
    this.userMessage = '';
    this.isLoading.set(true);

    /**
     * FIX LỖI "First content should be with role 'user'":
     * Chúng ta lọc bỏ tin nhắn chào mừng mặc định (index 0) ra khỏi lịch sử gửi lên AI.
     * Vì AI không cần biết câu chào tĩnh này, nó chỉ cần biết ngữ cảnh bắt đầu từ câu hỏi của khách.
     */
    const history = this.messages
      .slice(0, -1) // Lấy các tin nhắn trước tin nhắn vừa push
      .filter((m, index) => !(index === 0 && m.role === 'ai')) // Xóa tin nhắn đầu nếu là AI
      .map((m) => ({
        role: m.role === 'ai' ? 'ai' : 'user',
        text: m.text,
      }));

    this.aiService.sendMessage(msg, history).subscribe({
      next: (res: AiResponse) => {
        let text = '';
        let links: any[] = [];

        if (typeof res.data === 'object' && res.data !== null) {
          text = res.data.text;
          links = res.data.links || [];
        } else {
          text = res.data;
          const linkRegex = /\[LINK_SP\]\s*([^|]+)\s*\|\s*(.+)/i;
          const match = text.match(linkRegex);
          if (match) {
            text = text.replace(match[0], '').trim();
            links.push({ title: match[2].trim(), url: `/sp/${match[1].trim()}` });
          }
        }

        this.messages.push({ role: 'ai', text: text, links: links });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Lỗi AI:', err);
        this.messages.push({
          role: 'ai',
          text: 'Rất tiếc, hệ thống AI của tôi đang gặp chút sự cố.',
        });
        this.isLoading.set(false);
      },
    });
  }
}
