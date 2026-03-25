import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../models/product.model';
import { Brand } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  // Cần import CommonModule (cho *ngIf, *ngFor) và RouterLink (cho chuyển trang)
  imports: [CommonModule, RouterLink],
  
  // Trỏ đúng đến 2 file HTML và CSS nằm cùng thư mục
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Biến mảng chứa các câu quảng cáo trên top bar
  promos = [
    'QUÀ TẶNG TRỊ GIÁ 555K', 
    'MIỄN PHÍ GIAO HÀNG ĐƠN TỪ 699K', 
    'ĐỔI TRẢ TRONG VÒNG 30 NGÀY'
  ];
  
  // Dùng Signal của Angular 16+ để quản lý index (giúp UI update mượt hơn)
  activePromoIndex = signal(0);
  private promoInterval: any;

  // Signals cho dữ liệu thật
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  isLoggedIn = signal(false);
  currentUser = signal<any>(null);

  // Subscription để unsubscribe khi component destroy
  private subscriptions: Subscription = new Subscription();

  constructor(
    private categoryService: CategoryService,
    private brandService: BrandService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Logic tự động chuyển đổi dòng chữ quảng cáo mỗi 3 giây
    this.promoInterval = setInterval(() => {
      this.activePromoIndex.update(index => (index + 1) % this.promos.length);
    }, 3000);

    // Load dữ liệu thật
    this.loadCategories();
    this.loadBrands();

    // Subscribe vào auth state changes
    this.subscribeToAuthChanges();
  }

  ngOnDestroy() {
    // Unsubscribe khi component destroy để tránh memory leak
    this.subscriptions.unsubscribe();
    if (this.promoInterval) {
      clearInterval(this.promoInterval);
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadBrands() {
    this.brandService.getBrands(true).subscribe({
      next: (response) => {
        if (response.success) {
          this.brands.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });
  }

  // Subscribe vào AuthService observables để tự động update khi login/logout
  subscribeToAuthChanges() {
    const currentUserSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } else {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
      }
    });

    this.subscriptions.add(currentUserSub);
  }

  logout() {
    this.authService.logout();
    // No need to manually set signals - they'll update via subscription
    this.router.navigate(['/']);
  }
}