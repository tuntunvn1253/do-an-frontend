import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

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
    const emailVal = this.email().trim();
    const passwordVal = this.password().trim();

    if (!emailVal || !passwordVal) {
      this.error.set('Vui lòng nhập email và mật khẩu');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(emailVal, passwordVal).subscribe({
      next: (res) => {
        if (res.success) {
          this.success.set(true);
          
          // Add a short delay for user to see the success message
          setTimeout(() => {
            if (res.role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 500);

        } else {
          this.error.set(res.message || 'Đăng nhập thất bại');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error.set(err.error?.message || 'Lỗi kết nối. Vui lòng thử lại');
        this.loading.set(false);
      }
    });
  }

  socialLogin(provider: string) {
    this.error.set(`Đăng nhập qua ${provider} chưa được hỗ trợ`);
  }
}
