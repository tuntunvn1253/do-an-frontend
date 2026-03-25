import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressService } from '../../../core/services/user-address.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserAddress } from '../../../shared/models/user-address.model';

@Component({
  selector: 'app-user-address',
  standalone: true,
  imports: [CommonModule, FormsModule], // Bỏ RouterLink vì không dùng đến nữa
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.css'],
})
export class UserAddressComponent implements OnInit {
  addresses = signal<UserAddress[]>([]);
  loading = signal(true);
  showForm = signal(false);
  isEditMode = signal(false);

  // Dữ liệu form
  currentAddress: Partial<UserAddress> = {
    full_name: '',
    phone: '',
    address: '',
    is_default: false,
  };

  constructor(
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Chỉ giữ lại check đăng nhập, giao diện khung đã chuyển sang Layout
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAddresses();
  }

  loadAddresses() {
    this.loading.set(true);
    this.addressService.getMyAddresses().subscribe({
      next: (res) => {
        if (res.success) {
          this.addresses.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddForm() {
    this.currentAddress = { full_name: '', phone: '', address: '', is_default: false };
    this.isEditMode.set(false);
    this.showForm.set(true);
  }

  openEditForm(addr: UserAddress) {
    this.currentAddress = { ...addr };
    this.isEditMode.set(true);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  saveAddress() {
    if (
      !this.currentAddress.full_name ||
      !this.currentAddress.phone ||
      !this.currentAddress.address
    ) {
      alert('Vui lòng điền đầy đủ Tên, Số điện thoại và Địa chỉ!');
      return;
    }

    const request = this.isEditMode()
      ? this.addressService.updateAddress(this.currentAddress.id!, this.currentAddress)
      : this.addressService.addAddress(this.currentAddress);

    request.subscribe({
      next: (res) => {
        alert(res.message || 'Lưu thành công!');
        this.closeForm();
        this.loadAddresses();
      },
      error: (err) => alert('Lỗi: ' + (err.error?.message || 'Không thể lưu địa chỉ.')),
    });
  }

  deleteAddress(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          alert('Đã xóa địa chỉ!');
          this.loadAddresses();
        },
      });
    }
  }

  setDefault(id: number) {
    this.addressService.setDefault(id).subscribe({
      next: () => {
        this.loadAddresses();
      },
    });
  }
}
