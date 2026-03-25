import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AiChatComponent } from './features/public/Ai/ai-chat.component';
@Component({
  selector: 'app-root',
  standalone: true,
  // Khai báo HeaderComponent và FooterComponent vào đây để dùng được thẻ <app-header> và <app-footer>
  imports: [CommonModule, RouterOutlet, AiChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
