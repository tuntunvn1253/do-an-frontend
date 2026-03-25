import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, AuthResponse } from '../../shared/models/auth.model';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${API_BASE_URL}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load from localStorage on initialization
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
    if (savedToken) {
      this.tokenSubject.next(savedToken);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res.success && res.token) {
            const user: User = {
              id: res._id,
              full_name: res.full_name || '',
              email: res.email || '',
              role: res.role || 'customer'
            };
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
            this.tokenSubject.next(res.token);
          }
        })
      );
  }

  register(full_name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, { full_name, email, password });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(updatedUser: User): Observable<any> {
 
    return this.http.put<any>(`${API_BASE_URL}/users/${updatedUser.id}`, updatedUser).pipe(
      tap(res => {
        // cập nhật LocalStorage
        if (res.success) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/verifyemail/${token}`);
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/forgotpassword`, { email });
  }

  resetPassword(data: { email: string; otp: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/reset-password-otp`, data);
  }
}