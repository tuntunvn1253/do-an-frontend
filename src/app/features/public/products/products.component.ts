import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { Product, Category, Brand } from '../../../shared/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);

  // Filter state
  selectedCategorySlugs = signal<string[]>([]);
  selectedBrandNames = signal<string[]>([]);
  searchTerm = signal('');
  sortBy = signal<'created_at' | 'price' | 'name'>('created_at');
  sortOrder = signal<'ASC' | 'DESC'>('DESC');

  // Pagination state (basic)
  page = signal(1);
  pageSize = 12;
  totalProducts = signal(0);

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadFilters();
    this.route.queryParams.subscribe(() => {
      this.loadProducts();
    });
  }

  loadFilters() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories.set(res.data);
        }
      }
    });

    this.brandService.getBrands(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.brands.set(res.data);
        }
      }
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    const params: any = {
      limit: this.pageSize,
      page: this.page(),
      sortBy: this.sortBy(),
      order: this.sortOrder()
    };

    const categories = this.selectedCategorySlugs();
    if (categories.length) params.category_slug = categories.join(',');

    const brands = this.selectedBrandNames();
    if (brands.length) params.brand_name = brands.join(',');

    const search = this.searchTerm().trim();
    if (search) params.name = search;

    this.productService.getProducts(params).subscribe({
      next: (res) => {
        if (res.success) {
          this.products.set(res.products);
          this.totalProducts.set(res.totalProducts ?? res.products.length);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải sản phẩm. Vui lòng thử lại.');
        this.loading.set(false);
      }
    });
  }

  toggleCategory(slug: string) {
    const list = [...this.selectedCategorySlugs()];
    const idx = list.indexOf(slug);
    if (idx === -1) list.push(slug);
    else list.splice(idx, 1);
    this.selectedCategorySlugs.set(list);
    this.resetPageAndLoad();
  }

  toggleBrand(name: string) {
    const list = [...this.selectedBrandNames()];
    const idx = list.indexOf(name);
    if (idx === -1) list.push(name);
    else list.splice(idx, 1);
    this.selectedBrandNames.set(list);
    this.resetPageAndLoad();
  }

  setSort(sortBy: 'created_at' | 'price' | 'name') {
    this.sortBy.set(sortBy);
    this.resetPageAndLoad();
  }

  setOrder(order: 'ASC' | 'DESC') {
    this.sortOrder.set(order);
    this.resetPageAndLoad();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.resetPageAndLoad();
  }

  resetPageAndLoad() {
    this.page.set(1);
    this.loadProducts();
  }

  goToPage(page: number) {
    this.page.set(page);
    this.loadProducts();
  }
}
