import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${API_BASE_URL}/coupons`;

  constructor(private http: HttpClient) {}

  getAllCoupons(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getCouponById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCoupon(couponData: any): Observable<any> {
    return this.http.post(this.apiUrl, couponData);
  }

  updateCoupon(id: number, couponData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, couponData);
  }

  deleteCoupon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  validateCoupon(code: string, orderAmount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, { code, orderAmount });
  }
}
