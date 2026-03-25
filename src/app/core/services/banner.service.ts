import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${API_BASE_URL}/banners`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách banner (có thể lọc theo active và position)
  getBanners(active?: boolean, position?: string): Observable<any> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', active.toString());
    if (position) params = params.set('position', position);
    
    return this.http.get(this.apiUrl, { params });
  }

  createBanner(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateBanner(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteBanner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}