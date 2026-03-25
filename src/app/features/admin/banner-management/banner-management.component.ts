import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BannerService } from '../../../core/services/banner.service';

@Component({
  selector: 'app-banner-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './banner-management.component.html',
  styleUrls: ['./banner-management.component.css']
})
export class BannerManagementComponent implements OnInit {
  banners: any[] = [];
  loading: boolean = false;
  showModal: boolean = false;
  isAddMode: boolean = true;
  editingId: number | null = null;
  bannerForm: FormGroup;
  searchQuery: string = '';
  
  // Danh sách các vị trí banner để chọn (Tránh gõ sai)
  positions = ['home_slider', 'home_middle', 'sidebar_ads'];

  constructor(private bannerService: BannerService, private fb: FormBuilder) {
    this.bannerForm = this.fb.group({
      image_url: ['', Validators.required],
      link_url: [''],
      position: ['home_slider', Validators.required],
      sort_order: [0],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.loading = true;
    this.bannerService.getBanners().subscribe({
      next: (res) => {
        this.banners = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải banner:', err);
        this.loading = false;
      }
    });
  }

  // THÊM ĐOẠN NÀY: Hàm lọc dữ liệu
get filteredBanners() {
  const query = this.searchQuery.toLowerCase().trim();
  if (!query) return this.banners; // Trống thì hiện tất cả

  return this.banners.filter(b => 
    b.position.toLowerCase().includes(query) || // Tìm theo vị trí
    (b.link_url && b.link_url.toLowerCase().includes(query)) || // Tìm theo link
    b.id.toString().includes(query) // Tìm theo ID
  );
}

  openModal(banner?: any): void {
    this.isAddMode = !banner;
    this.showModal = true;
    if (banner) {
      this.editingId = banner.id;
      this.bannerForm.patchValue(banner);
    } else {
      this.editingId = null;
      this.bannerForm.reset({ is_active: true, sort_order: 0, position: 'home_slider' });
    }
  }

  saveBanner(): void {
    if (this.bannerForm.invalid) return;

    const data = this.bannerForm.value;
    const request = this.isAddMode 
      ? this.bannerService.createBanner(data)
      : this.bannerService.updateBanner(this.editingId!, data);

    request.subscribe({
      next: () => {
        this.loadBanners();
        this.showModal = false;
      }
    });
  }

  toggleActive(banner: any): void {
    // Chuyển đổi trạng thái 1 <-> 0
    const newStatus = banner.is_active ? 0 : 1;
    this.bannerService.updateBanner(banner.id, { is_active: newStatus }).subscribe({
      next: () => this.loadBanners()
    });
  }
}