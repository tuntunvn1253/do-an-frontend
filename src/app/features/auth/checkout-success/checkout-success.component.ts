import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/orders.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.css'],
  providers: [CurrencyPipe],
})
export class CheckoutSuccessComponent implements OnInit {
  order = signal<any>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit() {
    // Lấy ID đơn hàng từ URL (ví dụ: /checkout/success/123)
    const orderId = this.route.snapshot.paramMap.get('id');

    if (orderId) {
      this.fetchOrderDetails(Number(orderId));
    } else {
      this.error.set('Không tìm thấy thông tin đơn hàng.');
      this.isLoading.set(false);
    }
  }

  fetchOrderDetails(id: number) {
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.order.set(res.data);
        } else {
          this.error.set('Lỗi khi tải chi tiết đơn hàng.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Hệ thống không thể tìm thấy đơn hàng của bạn.');
        this.isLoading.set(false);
      },
    });
  }
}
