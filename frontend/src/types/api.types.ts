// Error Response Types
export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  errors?: FieldError[]; // Para erros de validação
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
  role?: "CUSTOMER" | "ADMIN" | "ESTOQUISTA";
}

// User Types
export type UserRole = "CUSTOMER" | "ADMIN" | "ESTOQUISTA";

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
export type ProductCategory =
  | "Monitor"
  | "Teclado_Mouse"
  | "Headset"
  | "Webcam"
  | "Cadeira"
  | "Mesa"
  | "Luminaria_Mesa"
  | "Organizador_Mesa"
  | "Organizador_Cabos"
  | "Suporte_Monitor"
  | "Impressora"
  | "Itens_Ergonomicos";

export const PRODUCT_CATEGORIES: Record<ProductCategory, string> = {
  Monitor: "Monitor",
  Teclado_Mouse: "Teclado e Mouse",
  Headset: "Headset",
  Webcam: "Webcam",
  Cadeira: "Cadeira",
  Mesa: "Mesa",
  Luminaria_Mesa: "Luminária de Mesa",
  Organizador_Mesa: "Organizador de Mesa",
  Organizador_Cabos: "Organizador de Cabos",
  Suporte_Monitor: "Suporte para Monitor",
  Impressora: "Impressora",
  Itens_Ergonomicos: "Itens Ergonômicos",
};

export interface Product {
  id: number;
  name: string;
  description?: string;
  rating?: number;
  quantity?: number;
  price: number;
  active: boolean;
  productImage?: string;
  category: ProductCategory;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  rating?: number;
  quantity?: number;
  price: number;
  image?: string;
  category: ProductCategory;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  rating?: number;
  quantity?: number;
  price?: number;
  active?: boolean;
  image?: string;
  category?: ProductCategory;
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
