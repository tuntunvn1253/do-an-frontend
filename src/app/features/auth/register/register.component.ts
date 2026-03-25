import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  newsletter = signal(false);
  
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // If already logged in, redirect to home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    const fullNameVal = this.fullName().trim();
    const emailVal = this.email().trim();
    const passwordVal = this.password().trim();
    const confirmPasswordVal = this.confirmPassword().trim();

    // Reset messages
    this.error.set(null);
    this.successMessage.set(null);

    // Validations
    if (!fullNameVal || !emailVal || !passwordVal || !confirmPasswordVal) {
      this.error.set('Vui lòng điền tất cả các trường');
      return;
    }

    if (fullNameVal.length < 3) {
      this.error.set('Họ và tên phải có ít nhất 3 ký tự');
      return;
    }

    if (!this.isValidEmail(emailVal)) {
      this.error.set('Email không hợp lệ');
      return;
    }

    if (passwordVal.length < 6) {
      this.error.set('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordVal !== confirmPasswordVal) {
      this.error.set('Mật khẩu xác nhận không khớp');
      return;
    }

    this.loading.set(true);

    this.authService.register(fullNameVal, emailVal, passwordVal).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage.set(res.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
        } else {
          this.error.set(res.message || 'Đăng ký thất bại');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.error.set(err.error?.message || 'Lỗi kết nối. Vui lòng thử lại');
        this.loading.set(false);
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
