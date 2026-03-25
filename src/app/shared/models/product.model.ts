export interface ProductVariant {
  price: number;
  stock_quantity: number;
   sku: string;
  id?: number;
  variant_options: any; // can be refined later
}

export interface Brand {
  id?: number;
  name: string;
  logo_url: string;
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
   sku: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  image_primary: string;
  product_type: string;
  status: string;
  is_featured: boolean;
  short_description: string;
  description: string;
  guide_use: string;
  specifications: string;
  created_at: string;
  updated_at: string;
  category_id: number;
  brand?: Brand;
  categories?: Category[];
  variants?: ProductVariant[];
}

// wrapper for API response
export interface ProductListResponse {
  success: boolean;
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}
