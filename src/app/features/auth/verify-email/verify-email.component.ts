import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  loading = signal(true);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Không tìm thấy token xác thực. Vui lòng thử lại link từ email của bạn.');
      return;
    }

    this.authService.verifyEmail(token).pipe(
      catchError(err => {
        // Return a new observable with a friendly error structure
        return of({
          success: false,
          message: err.error?.message || 'Token không hợp lệ hoặc đã hết hạn.'
        });
      })
    ).subscribe(response => {
      this.loading.set(false);
      if (response.success) {
        this.successMessage.set(response.message || 'Email đã được xác nhận thành công!');
      } else {
        this.errorMessage.set(response.message || 'Xác thực thất bại. Vui lòng thử lại.');
      }
    });
  }
}
