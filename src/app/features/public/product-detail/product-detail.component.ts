import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CompareService } from '../../../core/services/compare.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../shared/models/product.model';
import { CompareComponent } from '../compare/compare.component'; // <-- Updated to point to features/public/compare

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CompareComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  showCompare = signal(false);

  activeTab = signal<'description' | 'cleaning' | 'care'>('description');
  quantity = signal(1);

  // === QUẢN LÝ BIẾN THỂ (VARIANT) ===
  selectedVariantId = signal<number | null>(null);

  // Lấy biến thể hiện tại đang được chọn (mặc định lấy cái đầu tiên nếu chưa chọn)
  selectedVariant = computed(() => {
    const p = this.product();
    if (!p || !p.variants || p.variants.length === 0) return null;
    
    const id = this.selectedVariantId();
    if (id) {
      return p.variants.find(v => v.id === id) || p.variants[0];
    }
    return p.variants[0];
  });

  // Tự động cập nhật ID khi load xong sản phẩm
  private setInitialVariant() {
    const p = this.product();
    if (p && p.variants && p.variants.length > 0) {
      this.selectedVariantId.set(p.variants[0].id || null);
    }
  }

  selectVariant(id: number) {
    this.selectedVariantId.set(id);
    this.quantity.set(1); // Reset số lượng về 1 khi đổi loại
  }

  // === HÀM HELPER: Chuyển Object options thành chuỗi để hiển thị ===
  getVariantLabel(options: any): string {
    if (!options) return 'Mặc định';
    if (typeof options === 'string') return options;
    
    // Nếu là Object {"Màu": "Đỏ", "Size": "L"} -> "Đỏ, L"
    return Object.values(options).join(', ');
  }

  cleaningGuide = {
    title: 'HƯỚNG DẪN VỆ SINH & BẢO QUẢN VỢT CẦU LÔNG',
    content: `<h3>1. Vệ Sinh Khung Và Thân Vợt</h3><ul><li><strong>Khăn lau:</strong> Dùng khăn sợi mềm hơi ẩm, vắt thật kiệt nước.</li><li><strong>Hóa chất:</strong> Tuyệt đối không dùng dung môi, cồn.</li></ul>`
  };

  careGuide = {
    title: 'HƯỚNG DẪN BẢO QUẢN VỢT CẦU LÔNG',
    content: `<h3>1. Môi Trường Lưu Trữ</h3><ul><li><strong>Tránh nhiệt độ cao:</strong> Không để trong cốp xe hoặc nắng gắt.</li></ul>`
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private compareService: CompareService,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadProduct(slug);
    } else {
      this.error.set('Slug không hợp lệ');
      this.loading.set(false);
    }
  }

  private loadProduct(slug: string) {
    this.productService.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res.success) {
          this.product.set(res.product);
          this.setInitialVariant(); // Tự động chọn variant đầu tiên
        } else {
          this.error.set('Không tìm thấy sản phẩm');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Lỗi khi tải sản phẩm');
        this.loading.set(false);
      },
    });
  }

  updateQuantity(val: number) {
    const currentVariant = this.selectedVariant();
    const maxStock = currentVariant?.stock_quantity || 1;
    
    const newQty = this.quantity() + val;
    if (newQty >= 1 && newQty <= maxStock) {
      this.quantity.set(newQty);
    } else if (newQty > maxStock) {
      alert(`Sản phẩm này chỉ còn ${maxStock} sản phẩm trong kho.`);
    }
  }

  setActiveTab(tab: 'description' | 'cleaning' | 'care') {
    this.activeTab.set(tab);
  }

  onCompare() {
    const currentProduct = this.product();
    if (currentProduct) {
      this.compareService.addItem(currentProduct);
      this.compareService.openModal();
    }
  }

  // Hàm này xử lý nút đóng
  toggleCompare() {
    this.showCompare.update(v => !v);
  }

  handleAddToCart() {
    const variant = this.selectedVariant();
    if (variant && variant.id) {
      this.cartService.addToCart(variant.id, this.quantity()).subscribe({
        next: () => {
          alert("Đã thêm vào giỏ hàng!");
        },
        error: (err) => alert(err.error?.message || "Lỗi thêm vào giỏ"),
      });
    } else {
      alert("Vui lòng chọn biến thể sản phẩm");
    }
  }

  // === HÀM MỚI: MUA NGAY (Bỏ qua giỏ hàng) ===
  buyNow() {
    const variant = this.selectedVariant();
    if (!variant || !variant.id) {
        alert("Vui lòng chọn biến thể sản phẩm");
        return;
    }
    
    // 1. Checkout yêu cầu đăng nhập
    if (!localStorage.getItem('token')) {
        alert("Vui lòng đăng nhập để tiến hành mua hàng!");
        this.router.navigate(['/login']); 
        return;
    }

    // 2. Tạo một Object giả lập y hệt cấu trúc của Giỏ hàng thực tế
    const buyNowItem = {
      id: 0,
      product_variant_id: variant.id,
      quantity: this.quantity(),
      variant: {
        ...variant,
        product: this.product()
      }
    };

    // 3. Chuyển hướng sang trang Checkout, đính kèm dữ liệu Mua Ngay vào State
    this.router.navigate(['/checkout'], {
      state: { buyNowData: [buyNowItem] }
    });
  }
}
