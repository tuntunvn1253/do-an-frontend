import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService } from '../../../core/services/brand.service';

@Component({
  selector: 'app-brand-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './brand-management.component.html',
  styleUrls: ['./brand-management.component.css']
})
export class BrandManagementComponent implements OnInit {
  brands: any[] = [];
  editingId: number | null = null;
  editForm!: FormGroup;
  addForm!: FormGroup;
  searchQuery: string = '';
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  showModal: boolean = false;
  modalTitle: string = '';
  isAddMode: boolean = false;

  constructor(private brandService: BrandService, private fb: FormBuilder) {
    this.editForm = this.createForm();
    this.addForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      logo_url: [''],
      sort_order: [0],
      status: [true]
    });
  }

loadBrands(): void {
  this.loading = true;
  // Không truyền true ở đây để Admin luôn thấy đủ danh sách
  this.brandService.getBrands(false).subscribe({
    next: (response) => {
      this.brands = response.data || [];
      this.loading = false;
    },
    error: (error) => {
      this.errorMessage = 'Lỗi khi tải danh sách brand';
      this.loading = false;
    }
  });
}

  openAddModal(): void {
    this.isAddMode = true;
    this.modalTitle = 'Thêm Brand Mới';
    this.addForm.reset({ status: true, sort_order: 0 });
    this.showModal = true;
  }

  openEditModal(brand: any): void {
    this.isAddMode = false;
    this.modalTitle = 'Chỉnh Sửa Brand';
    this.editForm.patchValue(brand);
    this.editingId = brand.id;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = null;
    this.editForm.reset();
    this.addForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveBrand(): void {
    const form = this.isAddMode ? this.addForm : this.editForm;

    if (form.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc';
      return;
    }

    const formData = form.value;

    if (this.isAddMode) {
      this.createBrand(formData);
    } else {
      this.updateBrand(this.editingId!, formData);
    }
  }

  createBrand(data: any): void {
    this.loading = true;
    this.brandService.createBrand(data).subscribe({
      next: () => {
        this.successMessage = 'Brand đã được tạo thành công';
        this.loadBrands(); // reload từ backend
        setTimeout(() => this.closeModal(), 1500);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi tạo brand';
        console.error('Error creating brand:', error);
        this.loading = false;
      }
    });
  }

  updateBrand(id: number, data: any): void {
    this.loading = true;
    this.brandService.updateBrand(id, data).subscribe({
      next: () => {
        this.successMessage = 'Brand đã được cập nhật thành công';
        this.loadBrands(); // reload từ backend
        setTimeout(() => this.closeModal(), 1500);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Lỗi khi cập nhật brand';
        console.error('Error updating brand:', error);
        this.loading = false;
      }
    });
  }

  // Thêm Getter này để tự động tính toán danh sách hiển thị
get filteredBrands() {
  if (!this.searchQuery) {
    return this.brands; // Nếu không nhập gì, trả về toàn bộ danh sách
  }
  
  const query = this.searchQuery.toLowerCase().trim();
  
  return this.brands.filter(brand => 
    // Tìm theo tên
    brand.name.toLowerCase().includes(query) || 
    // Tìm theo mô tả (nếu có)
    (brand.description && brand.description.toLowerCase().includes(query)) ||
    // Tìm theo ID
    brand.id.toString().includes(query)
  );
}

 toggleStatus(brand: any): void {
  // Database là tinyint(1) nên dùng 1 và 0 cho chắc chắn
  const newStatus = (brand.status === 1 || brand.status === true) ? 0 : 1; 
  const updatedData = { ...brand, status: newStatus };

  this.loading = true;
  this.brandService.updateBrand(brand.id, updatedData).subscribe({
    next: () => {
      this.loadBrands(); // Load lại để cập nhật màu Badge (Hoạt động/Ẩn)
      this.successMessage = newStatus === 1 ? 'Đã hiển thị' : 'Đã ẩn thành công';
      this.loading = false;
      // Tự tắt thông báo sau 2s
      setTimeout(() => this.successMessage = '', 2000);
    },
    error: () => {
      this.errorMessage = 'Lỗi cập nhật trạng thái';
      this.loading = false;
    }
  });
}

  getStatusBadgeClass(status: boolean): string {
    return status ? 'badge-active' : 'badge-inactive';
  }

  getStatusText(status: boolean): string {
    return status ? 'Hoạt động' : 'Ẩn';
  }
}