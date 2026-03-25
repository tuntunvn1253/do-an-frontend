import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductListResponse } from '../../shared/models/product.model';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = API_BASE_URL; // http://localhost:8080/api

  constructor(private http: HttpClient) {}

  /**
   * Get list of products with optional query params.
   * Accepts same parameters as backend (/api/products).
   */
  getProducts(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
    name?: string;
    category_slug?: string;
    brand_name?: string;
    is_featured?: boolean;
    is_sale?: boolean;
  }): Observable<ProductListResponse> {
    // Đảm bảo có dấu / giữa baseUrl và products
    let url = `${this.baseUrl}/products`;
    
    if (params) {
      const queryParts: string[] = [];
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
        }
      });
      
      if (queryParts.length > 0) {
        // LUÔN LUÔN DÙNG DẤU "?" ĐỂ NỐI QUERY PARAMS
        url = `${url}?${queryParts.join('&')}`;
      }
    }

    return this.http.get<ProductListResponse>(url);
  }

  getProductBySlug(slug: string): Observable<{ success: boolean; product: Product }> {
    return this.http.get<{ success: boolean; product: Product }>(
      `${this.baseUrl}/products/slug/${slug}`
    );
  }

  compareProducts(ids: number[]): Observable<{ success: boolean; products: Product[] }> {
    const idsParam = ids.join(',');
    return this.http.get<{ success: boolean; products: Product[] }>(
      `${this.baseUrl}/products/compare?ids=${idsParam}`
    );
  }
}