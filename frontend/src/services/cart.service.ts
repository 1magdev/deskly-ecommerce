import { apiClient } from '@/lib/api-client';
import type {
  Cart,
  Address,
  SelectDeliveryAddressRequest,
  PaymentRequest
} from '@/types/api.types';

interface AddToCartRequest {
  productId: number;
}

class CartService {
  // Gestão de Carrinho
  async addToCart(data: AddToCartRequest): Promise<void> {
    return apiClient.post<void>('/cart/add', data);
  }

  async increaseQuantity(productId: number): Promise<void> {
    return apiClient.put<void>(`/cart/increase/${productId}`);
  }

  async decreaseQuantity(productId: number): Promise<void> {
    return apiClient.put<void>(`/cart/decrease/${productId}`);
  }

  async removeItem(productId: number): Promise<void> {
    return apiClient.delete<void>(`/cart/remove/${productId}`);
  }

  async getCart(): Promise<Cart> {
    return apiClient.get<Cart>('/cart');
  }

  // Checkout - Etapa 1: Inicializar
  async checkout(): Promise<Cart> {
    return apiClient.post<Cart>('/cart/checkout');
  }

  // Checkout - Etapa 2: Endereço de Entrega
  async getDeliveryAddresses(): Promise<Address[]> {
    return apiClient.get<Address[]>('/cart/checkout/addresses');
  }

  async selectDeliveryAddress(data: SelectDeliveryAddressRequest): Promise<Cart> {
    return apiClient.post<Cart>('/cart/checkout/address', data);
  }

  async validateDeliveryAddress(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/cart/checkout/payment');
  }

  // Checkout - Etapa 3: Forma de Pagamento
  async getPaymentMethods(): Promise<string[]> {
    return apiClient.get<string[]>('/cart/checkout/payment-methods');
  }

  async selectPayment(data: PaymentRequest): Promise<Cart> {
    return apiClient.post<Cart>('/cart/checkout/payment/select', data);
  }

  async validatePayment(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/cart/checkout/payment/validate');
  }
}

export const cartService = new CartService();
