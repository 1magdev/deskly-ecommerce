import { apiClient } from '@/lib/api-client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest
} from '@/types/api.types';

class UserService {
  async getUserProfile(): Promise<User> {
    return apiClient.get<User>('/users/profile');
  }

  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return apiClient.get<User[]>(`/users/all/${role}`);
  }

  async getBackofficeUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users/backoffice');
  }

  async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users', data);
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<void> {
    return apiClient.put<void>(`/users/${id}`, data);
  }

  async toggleUserStatus(id: number, active: boolean): Promise<void> {
    return apiClient.patch<void>(`/users/${id}/status?active=${active}`);
  }
}

export const userService = new UserService();
