import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Cart, CartItem } from '../../shared/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${API_BASE_URL}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  loadCart(): void {
    this.http.get<{ success: boolean, data: Cart }>(this.apiUrl).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartSubject.next(res.data);
        }
      },
      error: (err) => {
        console.error('Error loading cart', err);
      }
    });
  }

  addToCart(productVariantId: number, quantity: number): Observable<any> {
    return this.http.post<{ success: boolean, data: CartItem }>(this.apiUrl, {
      product_variant_id: productVariantId,
      quantity
    }).pipe(
      tap((res) => {
        if (res.success) {
          this.loadCart();
        }
      })
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put<{ success: boolean, data: CartItem }>(`${this.apiUrl}/${cartItemId}`, {
      quantity
    }).pipe(
      tap((res) => {
        if (res.success) {
          this.loadCart();
        }
      })
    );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.apiUrl}/${cartItemId}`).pipe(
      tap((res) => {
        if (res.success) {
          this.loadCart();
        }
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete<{ success: boolean, message: string }>(this.apiUrl).pipe(
      tap((res) => {
        if (res.success) {
          this.cartSubject.next(null);
        }
      })
    );
  }

  getCartCount(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getCartTotal(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((acc, item) => {
      const price = item.variant?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  }
}
