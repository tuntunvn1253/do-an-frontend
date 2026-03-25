import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // <-- Sửa lại đường dẫn và tên Class chuẩn

// Khởi động bằng AppComponent thay vì App
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));