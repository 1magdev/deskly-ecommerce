// Error Response Types
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Record<string, string>; // Para erros de validação
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
  cpf: string;
  role?: 'CUSTOMER' | 'ADMIN' | 'ESTOQUISTA';
}

// User Types
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  ESTOQUISTA = 'ESTOQUISTA'
}

export interface User {
  id: number;
  fullname: string;
  email: string;
  cpf: string;
  role: UserRole;
  active: boolean;
}

export interface UpdateUserRequest {
  fullname?: string;
  email?: string;
  password?: string;
  cpf?: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description?: string;
  rating?: number;
  quantity?: number;
  price: number;
  active: boolean;
  mainImageIndex?: number;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  rating?: number;
  quantity?: number;
  price: number;
  mainImageIndex?: number;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  rating?: number;
  quantity?: number;
  price?: number;
  active?: boolean;
  mainImageIndex?: number;
}

// Pagination Types
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageRequest {
  page?: number;
  size?: number;
  search?: string;
}
