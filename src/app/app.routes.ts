import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';


import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';

import { HomeComponent } from './features/public/home/home.component';
import { ProductsComponent } from './features/public/products/products.component';
import { ProductDetailComponent } from './features/public/product-detail/product-detail.component';
import { UserProfileComponent } from './features/auth/user-profile/user-profile.component';
import { UserAddressComponent } from './features/auth/user-address/user-address.component';
import { CheckoutComponent } from './features/auth/checkout/checkout.component';
import { CheckoutSuccessComponent } from './features/auth/checkout-success/checkout-success.component';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { BrandManagementComponent } from './features/admin/brand-management/brand-management.component';
import { BannerManagementComponent } from './features/admin/banner-management/banner-management.component';
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { CouponManagementComponent } from './features/admin/coupon-management/coupon-management.component';
import { CategoryManagementComponent } from './features/admin/category-management/category-management.component';
import { CartComponent } from './features/public/cart/cart';

import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'sp/:slug', component: ProductDetailComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'checkout-success/:id', component: CheckoutSuccessComponent },
      // === NHÚNG KHỐI USER VÀO ĐÂY ===
      {
        path: 'user',
        component: UserLayoutComponent,
        children: [
          // Mặc định vào /user sẽ tự động chuyển sang /user/profile
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          { path: 'profile', component: UserProfileComponent },
          { path: 'addresses', component: UserAddressComponent },
        ],
      },
      // ==================================
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'brands', component: BrandManagementComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'banners', component: BannerManagementComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'coupons', component: CouponManagementComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
