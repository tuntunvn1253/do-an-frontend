import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  showModal: boolean = false;
  editingUser: any = null;
  userForm: FormGroup;
  searchQuery: string = '';

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      full_name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      role: ['customer', Validators.required],
      status: ['active']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải người dùng:', err);
        this.loading = false;
      }
    });
  }

  get filteredUsers() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.users;

    return this.users.filter(u => 
      u.full_name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query))
    );
  }

  openEditModal(user: any): void {
    this.editingUser = user;
    this.showModal = true;
    this.userForm.patchValue({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    });
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    const data = this.userForm.getRawValue();
    this.userService.updateUser(this.editingUser.id, data).subscribe({
      next: () => {
        this.loadUsers();
        this.showModal = false;
        alert('Cập nhật người dùng thành công!');
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Không thể cập nhật người dùng.'));
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          alert('Xóa người dùng thành công!');
        }
      });
    }
  }
}
