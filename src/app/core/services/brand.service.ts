import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private apiUrl = `${API_BASE_URL}/brands`;

  constructor(private http: HttpClient) {}

  // Lấy tất cả brand, có thể filter active=true
getBrands(activeOnly: boolean = false): Observable<any> {
  const url = activeOnly ? `${this.apiUrl}?active=true` : this.apiUrl;
  return this.http.get<any>(url);
}
  getBrandById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createBrand(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateBrand(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }
}