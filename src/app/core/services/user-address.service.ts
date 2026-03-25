import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAddress } from '../../shared/models/user-address.model';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = `${API_BASE_URL}/address`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách địa chỉ của User đang đăng nhập
  getMyAddresses(): Observable<{success: boolean, data: UserAddress[]}> {
    return this.http.get<any>(this.apiUrl);
  }

  // Thêm địa chỉ mới
  addAddress(data: Partial<UserAddress>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Sửa địa chỉ
  updateAddress(id: number, data: Partial<UserAddress>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Xóa địa chỉ
  deleteAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Đặt làm mặc định
  setDefault(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/set-default`, {});
  }
}