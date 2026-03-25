import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { BrandService } from '../../../core/services/brand.service';
import { Category } from '../../models/product.model';
import { Brand } from '../../models/product.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  // Signals cho dữ liệu thật
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);

  constructor(
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadBrands() {
    this.brandService.getBrands().subscribe({
      next: (response) => {
        if (response.success) {
          this.brands.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });
  }
}