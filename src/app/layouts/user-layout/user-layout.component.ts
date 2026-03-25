import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/auth.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-layout',
  standalone: true,

  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css'],
})
export class UserLayoutComponent implements OnInit, OnDestroy {
  user = signal<User | null>(null);
  private subscriptions: Subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user.set(this.authService.getCurrentUser());

    // Lắng nghe thay đổi User
    const currentUserSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user.set(user);
      } else {
        this.router.navigate(['/login']);
      }
    });

    this.subscriptions.add(currentUserSub);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
