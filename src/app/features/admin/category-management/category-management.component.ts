import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: any[] = [];
  loading: boolean = false;
  showModal: boolean = false;
  isAddMode: boolean = true;
  editingId: number | null = null;
  categoryForm: FormGroup;
  searchQuery: string = '';

  constructor(private categoryService: CategoryService, private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      image_url: [''],
      sort_order: [0],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải danh mục:', err);
        this.loading = false;
      }
    });
  }

  get filteredCategories() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.categories;

    return this.categories.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.slug.toLowerCase().includes(query)
    );
  }

  // Tự động tạo slug khi gõ tên
  onNameChange() {
    if (this.isAddMode) {
      const name = this.categoryForm.get('name')?.value;
      const slug = this.generateSlug(name);
      this.categoryForm.patchValue({ slug });
    }
  }

  generateSlug(text: string): string {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  openModal(category?: any): void {
    this.isAddMode = !category;
    this.showModal = true;
    if (category) {
      this.editingId = category.id;
      this.categoryForm.patchValue(category);
    } else {
      this.editingId = null;
      this.categoryForm.reset({ 
        sort_order: 0, 
        status: true 
      });
    }
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const data = this.categoryForm.value;
    const request = this.isAddMode 
      ? this.categoryService.createCategory(data)
      : this.categoryService.updateCategory(this.editingId!, data);

    request.subscribe({
      next: () => {
        this.loadCategories();
        this.showModal = false;
        alert(this.isAddMode ? 'Thêm danh mục thành công!' : 'Cập nhật danh mục thành công!');
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Không thể lưu danh mục.'));
      }
    });
  }

  deleteCategory(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          alert('Xóa danh mục thành công!');
        },
        error: (err) => {
          alert('Lỗi: ' + (err.error?.message || 'Không thể xóa danh mục.'));
        }
      });
    }
  }

  toggleStatus(category: any): void {
    const newStatus = !category.status;
    this.categoryService.updateCategory(category.id, { status: newStatus }).subscribe({
      next: () => this.loadCategories()
    });
  }
}
