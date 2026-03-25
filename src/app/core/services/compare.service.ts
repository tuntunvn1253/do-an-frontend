import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class CompareService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/compare`;

  // Signal lưu danh sách ID
  private compareIdsSignal = signal<number[]>(
    JSON.parse(localStorage.getItem('compare_items') || '[]')
  );

  // Signal lưu categoryId của sản phẩm đầu tiên để làm chuẩn
  private currentCategoryId = signal<number | null>(
    Number(localStorage.getItem('compare_category')) || null
  );

  compareIds = this.compareIdsSignal.asReadonly();
  count = computed(() => this.compareIdsSignal().length);

  // Thêm signal để quản lý việc hiển thị modal so sánh
  showModal = signal(false);

  // Giữ lại Observable để tương thích với các component đang dùng (như CompareComponent)
  compareItems$ = toObservable(this.compareIdsSignal);

  constructor() {
    // Tự động lưu vào LocalStorage khi có thay đổi
    effect(() => {
      localStorage.setItem('compare_items', JSON.stringify(this.compareIdsSignal()));
      if (this.currentCategoryId()) {
        localStorage.setItem('compare_category', this.currentCategoryId()!.toString());
      } else {
        localStorage.removeItem('compare_category');
      }
    });
  }

  toggleModal() {
    this.showModal.update(v => !v);
  }

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // Tương thích với CompareComponent.ts cũ
  getItems(): number[] {
    return this.compareIdsSignal();
  }

  getCompareDetails(): Observable<any> {
    const ids = this.compareIdsSignal().join(',');
    
    // Nếu không có ID nào, trả về một Observable rỗng thay vì gọi Backend
    if (!ids) {
      return new Observable(subscriber => {
        subscriber.next({ success: true, products: [] });
        subscriber.complete();
      });
    }

    return this.http.get(`${this.apiUrl}?ids=${ids}`);
  }

  addItem(product: any) {
    const current = this.compareIdsSignal();
    const productId = product.id;
    const categoryId = product.category_id;

    // 1. Kiểm tra trùng
    if (current.includes(productId)) {
      alert('Sản phẩm này đã có trong danh sách so sánh!');
      return;
    }

    // 2. Kiểm tra số lượng (Tối đa 3)
    if (current.length >= 3) {
      alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm!');
      return;
    }

    // 3. Kiểm tra cùng loại sản phẩm
    if (current.length > 0 && this.currentCategoryId() !== categoryId) {
      alert('Bạn chỉ có thể so sánh các sản phẩm cùng loại!');
      return;
    }

    // Lưu categoryId nếu là sản phẩm đầu tiên
    if (current.length === 0) {
      this.currentCategoryId.set(categoryId);
    }

    this.compareIdsSignal.set([...current, productId]);
  }

  remove(id: number) {
    this.compareIdsSignal.update(ids => {
      const newIds = ids.filter(i => i !== id);
      // Nếu xóa hết thì reset luôn category chuẩn
      if (newIds.length === 0) this.currentCategoryId.set(null);
      return newIds;
    });
  }

  clear() {
    this.compareIdsSignal.set([]);
    this.currentCategoryId.set(null);
  }
}
