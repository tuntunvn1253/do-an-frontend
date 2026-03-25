import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { Product, Category, Brand, ProductListResponse } from '../../../shared/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // LOGIC BANNER CAROUSEL
  banners = [
    'https://images.unsplash.com/photo-1625909092293-64142026f540?w=1920&h=634&fit=crop',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=634&fit=crop',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&h=634&fit=crop',
  ];
  currentBanner = signal(0); // Quản lý index banner đang hiển thị

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
  ) {}

  ngOnInit() {
    // Tự động chuyển banner mỗi 5 giây
    setInterval(() => {
      this.nextBanner();
    }, 5000);

    // load product data from backend
    this.loadNewProducts();
    this.loadFeaturedProducts();

    // load category/brand lists
    this.loadCategories();
    this.loadBrands();
  }

  private loadNewProducts() {
    // get newest products with limit 6
    this.productService.getProducts({ limit: 6, sortBy: 'created_at', order: 'DESC' }).subscribe(
      (res: ProductListResponse) => {
        if (res.success) {
          this.newProducts.set(res.products);
        }
      },
      (err: any) => {
        console.error('Failed to load new products', err);
      },
    );
  }

  private loadFeaturedProducts() {
    // fetch featured products (backend filter support added)
    this.productService.getProducts({ limit: 10, is_featured: true }).subscribe(
      (res: ProductListResponse) => {
        if (res.success) {
          this.featuredProducts.set(res.products);
        }
      },
      (err: any) => {
        console.error('Failed to load featured products', err);
      },
    );
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe(
      (res: any) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      },
      (err: any) => {
        console.error('Failed to load categories', err);
      },
    );
  }

  private loadBrands() {
    this.brandService.getBrands().subscribe(
      (res: any) => {
        if (res.success) {
          this.brands.set(res.data);
        }
      },
      (err: any) => {
        console.error('Failed to load brands', err);
      },
    );
  }

  // Chuyển tới banner tiếp theo
  nextBanner() {
    this.currentBanner.update((i) => (i + 1) % this.banners.length);
  }

  // Chuyển lùi banner
  prevBanner() {
    this.currentBanner.update((i) => (i - 1 + this.banners.length) % this.banners.length);
  }

  // Click vào các dấu chấm tròn để chuyển
  goToBanner(index: number) {
    this.currentBanner.set(index);
  }

  // signals to hold product lists fetched from backend
  newProducts = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  saleProducts = signal<Product[]>([]);

  // signals for categories and brands
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);

  // Hàm trượt ngang danh sách sản phẩm (Đã sửa lỗi TypeScript)
  // Đổi ElementRef thành HTMLElement vì truyền trực tiếp từ HTML template sang
  scrollCarousel(element: HTMLElement, direction: 'left' | 'right') {
    if (element) {
      const scrollAmount = direction === 'left' ? -360 : 360; // 341px card + 19px gap
      // Vì là HTMLElement thuần, ta gọi thẳng hàm scrollBy thay vì phải qua nativeElement
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}
