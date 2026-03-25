import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AddressService } from '../../../core/services/user-address.service';
import { OrderService } from '../../../core/services/orders.service';
import { CouponService } from '../../../core/services/coupon.service';
import { UserAddress } from '../../../shared/models/user-address.model';
import { CartItem, Cart } from '../../../shared/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  addresses = signal<UserAddress[]>([]);
  selectedAddressId = signal<number | null>(null);
  paymentMethod = signal<string>('cod');
  orderNote = signal<string>('');
  isSubmitting = signal<boolean>(false);

  // === COUPON FIELDS ===
  couponCode = signal<string>('');
  appliedCoupon = signal<any>(null);
  discountAmount = signal<number>(0);
  couponError = signal<string>('');

  cart$!: Observable<Cart | null>;
  isBuyNow = false; // Biến kiểm tra luồng Mua Ngay

  constructor(
    public cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private couponService: CouponService,
    private router: Router,
  ) {
// ... (constructor logic same)
    // === PHÂN TÁCH HAI LUỒNG: MUA NGAY HOẶC MUA TỪ GIỎ HÀNG ===
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { buyNowData?: any[] };

    if (state && state.buyNowData) {
      // LUỒNG 1: Mua ngay (Dữ liệu từ Product Detail truyền sang)
      this.isBuyNow = true;
      // Tạo một Observable giả lập chứa sản phẩm Mua Ngay (Ép nó cư xử như 1 cái giỏ hàng)
      this.cart$ = of({ id: 0, user_id: 0, items: state.buyNowData } as Cart);
    } else {
      // LUỒNG 2: Mua từ giỏ hàng (Lấy từ CartService thông thường)
      this.cart$ = this.cartService.cart$;
    }
  }

  ngOnInit() {
    // Chỉ tải lại giỏ hàng từ DB nếu KHÔNG PHẢI là luồng Mua Ngay
    if (!this.isBuyNow) {
      this.cartService.loadCart();
    }
    this.loadAddresses();
  }

  loadAddresses() {
    this.addressService.getMyAddresses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.addresses.set(res.data);
          const defaultAddr = res.data.find((a: UserAddress) => a.is_default) || res.data[0];
          if (defaultAddr) {
            this.selectedAddressId.set(defaultAddr.id);
          }
        }
      },
    });
  }

  // === HÀM MỚI: Tự tính tổng tiền trực tiếp từ danh sách đang hiển thị ===
  // (Sẽ giúp tính đúng tiền cho cả Mua Ngay và Mua Giỏ Hàng)
  calculateTotal(items: CartItem[]): number {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0);
  }

  // === HÀM ÁP DỤNG MÃ GIẢM GIÁ ===
  applyCoupon(items: CartItem[]) {
    if (!this.couponCode().trim()) {
      this.couponError.set('Vui lòng nhập mã giảm giá');
      return;
    }

    const totalAmount = this.calculateTotal(items);
    
    this.couponService.validateCoupon(this.couponCode(), totalAmount).subscribe({
      next: (res) => {
        if (res.success) {
          const coupon = res.data;
          let discount = 0;
          
          if (coupon.discount_type === 'percent') {
            discount = (totalAmount * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
              discount = Number(coupon.max_discount_amount);
            }
          } else {
            discount = Number(coupon.discount_value);
          }

          this.appliedCoupon.set(coupon);
          this.discountAmount.set(discount);
          this.couponError.set('');
        }
      },
      error: (err) => {
        this.appliedCoupon.set(null);
        this.discountAmount.set(0);
        this.couponError.set(err.error?.message || 'Mã giảm giá không hợp lệ');
      }
    });
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.discountAmount.set(0);
    this.couponCode.set('');
    this.couponError.set('');
  }

  placeOrder(cart: Cart | null) {
    const cartItems = cart?.items || [];

    if (!this.selectedAddressId()) {
      alert('Vui lòng chọn địa chỉ giao hàng trước khi thanh toán!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Đơn hàng trống!');
      return;
    }

    this.isSubmitting.set(true);
    const selectedAddr = this.addresses().find((a) => a.id === this.selectedAddressId());

    const payload = {
      orderItems: cartItems.map((item: CartItem) => ({
        product_variant_id: item.variant?.id || item.product_variant_id,
        quantity: item.quantity,
      })),
      shippingAddress: {
        name: selectedAddr?.full_name,
        phone: selectedAddr?.phone,
        address: selectedAddr?.address,
        note: this.orderNote(),
      },
      paymentMethod: this.paymentMethod() === 'vnpay' ? 'banking' : this.paymentMethod(),
      shippingFee: 0,
      couponCode: this.appliedCoupon()?.code || null, // Gửi mã giảm giá nếu có
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        if (res.success) {
          // Xóa giỏ hàng trước khi chuyển đi (Chỉ áp dụng luồng mua từ giỏ)
          if (!this.isBuyNow) {
             this.cartService.clearCart().subscribe();
          }

          // KIỂM TRA: Nếu backend trả về link PayOS -> Chuyển hướng sang trang PayOS
          if (res.checkoutUrl) {
            window.location.href = res.checkoutUrl;
          } else {
            // Nếu thanh toán COD -> Chuyển về trang lịch sử đơn hàng
            this.router.navigate(['/checkout-success', res.data.id]);
          }
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Lỗi đặt hàng:', err);
        alert('Lỗi: ' + (err.error?.message || 'Không thể tạo đơn hàng lúc này.'));
        this.isSubmitting.set(false);
      },
    });
  }
}
