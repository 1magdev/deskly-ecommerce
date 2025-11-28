import { apiClient } from '@/lib/api-client';

interface AddToCartRequest {
  productId: number;
}

class CartService {
  async addToCart(data: AddToCartRequest): Promise<void> {
    return apiClient.post<void>('/cart/add', data);
  }

  async increaseQuantity(itemId: number): Promise<void> {
    return apiClient.put<void>(`/cart/increase/${itemId}`);
  }

  async decreaseQuantity(itemId: number): Promise<void> {
    return apiClient.put<void>(`/cart/decrease/${itemId}`);
  }

  async removeItem(itemId: number): Promise<void> {
    return apiClient.delete<void>(`/cart/remove/${itemId}`);
  }
}

export const cartService = new CartService();
