import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    const emailVal = this.email().trim();
    if (!emailVal) {
      this.errorMessage.set('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.forgotPassword(emailVal).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.successMessage.set(res.message || 'Yêu cầu đã được gửi. Chuẩn bị chuyển hướng...');
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { queryParams: { email: emailVal } });
          }, 2000); // Redirect after 2 seconds
        } else {
          this.errorMessage.set(res.message || 'Đã xảy ra lỗi.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Lỗi kết nối. Vui lòng thử lại.');
      }
    });
  }
}
