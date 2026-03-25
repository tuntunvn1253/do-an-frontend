import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../shared/models/auth.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  // === DATA TÀI KHOẢN ===
  user = signal<User | null>(null);
  loadingProfile = signal(false);
  savingProfile = signal(false);
  errorProfile = signal<string | null>(null);
  successProfile = signal(false);

  fullName = signal('');
  email = signal('');
  phone = signal('');
  gender = signal('');

  private subscriptions: Subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.user.set(this.authService.getCurrentUser());
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();

    const currentUserSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user.set(user);
        this.fullName.set(user.full_name || '');
        this.email.set(user.email || '');
        this.phone.set(user.phone || '');
        this.gender.set(user.gender || '');
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.subscriptions.add(currentUserSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // --- LOGIC PROFILE ---
  loadUserProfile() {
    this.loadingProfile.set(true);
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.fullName.set(currentUser.full_name || '');
      this.email.set(currentUser.email || '');
      this.phone.set(currentUser.phone || '');
      this.gender.set(currentUser.gender || '');
    } else {
      this.errorProfile.set('Không thể tải thông tin người dùng');
    }
    this.loadingProfile.set(false);
  }

  onSubmitProfile() {
    if (!this.user()) return;

    this.savingProfile.set(true);
    this.errorProfile.set(null);
    this.successProfile.set(false);

    const updatedUser = {
      ...this.user()!,
      full_name: this.fullName(),
      phone: this.phone(),
      gender: (this.gender ? this.gender() : '') as 'male' | 'female' | 'other' | ''
    };

    this.authService.updateCurrentUser(updatedUser).subscribe({
      next: () => {
        this.successProfile.set(true);
        this.savingProfile.set(false);
        setTimeout(() => this.successProfile.set(false), 3000);
      },
      error: (err) => {
        console.error("Lỗi:", err);
        this.errorProfile.set(err.error?.message || 'Có lỗi xảy ra khi lưu vào Database.');
        this.savingProfile.set(false);
      }
    });
  }
}