import { apiClient } from '@/lib/api-client';
import type { Order, OrderRequest } from '@/types/api.types';

class OrderService {
  async createOrder(data: OrderRequest): Promise<Order> {
    return apiClient.post<Order>('/orders', data);
  }

  async getOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders');
  }

  async getOrderById(id: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  }
}

export const orderService = new OrderService();

