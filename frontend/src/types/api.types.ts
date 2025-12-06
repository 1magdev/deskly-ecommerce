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
  confirmPassword?: string;
  cpf: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  role?: "CUSTOMER" | "ADMIN" | "BACKOFFICE";
  addresses?: AddressCreateRequest[];
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  cardHolderName?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  cardExpiration?: string;
}

// User Types
export type UserRole = "CUSTOMER" | "ADMIN" | "BACKOFFICE";

export interface User {
  id: number;
  fullname: string;
  email: string;
  cpf: string;
  gender?: string;
  birthDate?: string;
  role: UserRole;
  active: boolean;
  phone?: string;
}

export interface CreateUserRequest {
  fullname: string;
  email: string;
  cpf: string;
  gender?: string;
  birthDate?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  cardHolderName?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  cardExpiration?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  fullname?: string;
  cpf?: string;
  gender?: string;
  birthDate?: string;
  password?: string;
  confirmPassword?: string;
  role?: UserRole;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
  cardHolderName?: string;
  cardLastDigits?: string;
  cardBrand?: string;
  cardExpiration?: string;
  phone?: string;
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
  images?: string[]; // Array de imagens do produto
  category: ProductCategory;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  rating?: number;
  quantity?: number;
  price: number;
  image?: string; // Deprecated - usar images
  images?: string[]; // Array de imagens em base64
  category: ProductCategory;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  rating?: number;
  quantity?: number;
  price?: number;
  active?: boolean;
  image?: string; // Deprecated - usar images
  images?: string[]; // Array de imagens em base64
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

// Address Types
export interface Address {
  id: number;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryAddress: boolean;
  paymentAddress: boolean;
}

export interface AddressCreateRequest {
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryAddress?: boolean;
  paymentAddress: boolean
}

// Cart Types
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  cart: Cart;
}

export interface Cart {
  id: number;
  sessionId: string;
  user?: User;
  deliveryAddress?: Address;
  paymentAddress?: Address;
  shippingCost: number;
  subtotal: number;
  deliveryAddressSelected: boolean;
  paymentAddressSelected: boolean;
  paymentMethod?: "BOLETO" | "CARD";
  paymentInstallments?: number;
  paymentCardHolderName?: string;
  paymentCardLastDigits?: string;
  paymentCardBrand?: string;
  paymentCardExpiration?: string;
  items: CartItem[];
}

// Checkout Types
export interface SelectDeliveryAddressRequest {
  addressId: number;
}

export interface SelectPaymentAddressRequest {
  addressId: number;
}

export interface PaymentRequest {
  method: "BOLETO" | "CARD";
  cardNumber?: string;
  cardCvv?: string;
  cardHolderName?: string;
  cardExpiration?: string;
  installments?: number;
}

// Order Types
export type OrderStatus =
  | "AGUARDANDO_PAGAMENTO"
  | "PAGAMENTO_REJEITADO"
  | "PAGAMENTO_APROVADO"
  | "AGUARDANDO_RETIRADA"
  | "EM_TRANSITO"
  | "ENTREGUE";
export type PaymentMethod = "CREDIT_CARD" | "BOLETO";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  PAGAMENTO_REJEITADO: "Pagamento Rejeitado",
  PAGAMENTO_APROVADO: "Pagamento Aprovado",
  AGUARDANDO_RETIRADA: "Aguardando Retirada",
  EM_TRANSITO: "Em Trânsito",
  ENTREGUE: "Entregue",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  BOLETO: "Boleto Bancário",
};

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  totalValue: number;
  shippingValue: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  cardLastFourDigits?: string;
  address: Address;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderRequest {
  shippingValue: number;
  addressId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
  paymentMethod: PaymentMethod;
  cardHolderName?: string;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCvv?: string;
}
