import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email = signal('');
  otp = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const emailFromQuery = params['email'];
      if (emailFromQuery) {
        this.email.set(emailFromQuery);
      }
    });
  }

  onSubmit() {
    if (!this.email() || !this.otp() || !this.password()) {
      this.errorMessage.set('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    if (this.password().length < 6) {
        this.errorMessage.set('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const data = {
      email: this.email(),
      otp: this.otp(),
      password: this.password()
    };

    this.authService.resetPassword(data).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.successMessage.set(res.message || 'Mật khẩu của bạn đã được đặt lại thành công!');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000); // Redirect to login after 3 seconds
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
