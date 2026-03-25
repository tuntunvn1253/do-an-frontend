import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';

@Component({
  selector: 'app-coupon-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coupon-management.component.html',
  styleUrls: ['./coupon-management.component.css']
})
export class CouponManagementComponent implements OnInit {
  coupons: any[] = [];
  loading: boolean = false;
  showModal: boolean = false;
  isAddMode: boolean = true;
  editingId: number | null = null;
  couponForm: FormGroup;
  searchQuery: string = '';

  constructor(private couponService: CouponService, private fb: FormBuilder) {
    this.couponForm = this.fb.group({
      code: ['', Validators.required],
      description: [''],
      discount_type: ['percent', Validators.required],
      discount_value: [0, [Validators.required, Validators.min(0)]],
      max_discount_amount: [null],
      min_order_amount: [0],
      usage_limit_total: [null],
      starts_at: [null],
      ends_at: [null],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading = true;
    this.couponService.getAllCoupons().subscribe({
      next: (res) => {
        this.coupons = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải mã giảm giá:', err);
        this.loading = false;
      }
    });
  }

  get filteredCoupons() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.coupons;

    return this.coupons.filter(c => 
      c.code.toLowerCase().includes(query) || 
      (c.description && c.description.toLowerCase().includes(query))
    );
  }

  openModal(coupon?: any): void {
    this.isAddMode = !coupon;
    this.showModal = true;
    if (coupon) {
      this.editingId = coupon.id;
      // Format dates for input type="datetime-local"
      const formattedCoupon = { ...coupon };
      if (coupon.starts_at) formattedCoupon.starts_at = new Date(coupon.starts_at).toISOString().slice(0, 16);
      if (coupon.ends_at) formattedCoupon.ends_at = new Date(coupon.ends_at).toISOString().slice(0, 16);
      this.couponForm.patchValue(formattedCoupon);
    } else {
      this.editingId = null;
      this.couponForm.reset({ 
        discount_type: 'percent', 
        discount_value: 0, 
        is_active: true,
        min_order_amount: 0 
      });
    }
  }

  saveCoupon(): void {
    if (this.couponForm.invalid) return;

    const data = this.couponForm.value;
    const request = this.isAddMode 
      ? this.couponService.createCoupon(data)
      : this.couponService.updateCoupon(this.editingId!, data);

    request.subscribe({
      next: () => {
        this.loadCoupons();
        this.showModal = false;
        alert(this.isAddMode ? 'Thêm mã thành công!' : 'Cập nhật mã thành công!');
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Không thể lưu mã giảm giá.'));
      }
    });
  }

  deleteCoupon(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      this.couponService.deleteCoupon(id).subscribe({
        next: () => {
          this.loadCoupons();
          alert('Xóa mã giảm giá thành công!');
        }
      });
    }
  }
}
