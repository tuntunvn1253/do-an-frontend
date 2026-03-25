export interface User {
  id?: number;
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | '';
  address?: string;
  role?: string;
  status?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: User;
  _id?: number;
  full_name?: string;
  email?: string;
  role?: string;
  token?: string;
  message?: string;
}