import { apiClient } from '@/lib/api-client';
import type { Order, OrderRequest, PageResponse, OrderStatus } from '@/types/api.types';

// OrderStatus is now imported from api.types.ts
class OrderService {
  async createOrder(data: OrderRequest): Promise<Order> {
    return apiClient.post<Order>('/orders', data);
  }

  async getOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders');
  }

  async getAllOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders/all');
  }

  async getOrderById(id: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  }

  async getAllOrdersForBackoffice(page: number = 0, size: number = 10): Promise<PageResponse<Order>> {
    return apiClient.get<PageResponse<Order>>(`/orders/backoffice/all?page=${page}&size=${size}`);
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${orderId}/status?status=${status}`);
  }
}

export const orderService = new OrderService();

