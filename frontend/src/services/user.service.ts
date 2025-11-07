import { apiClient } from '@/lib/api-client';
import type {
  User,
  RegisterRequest,
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
    return apiClient.get<User[]>(`/users/${role}`);
  }

  async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  async createUser(data: RegisterRequest): Promise<User> {
    return apiClient.post<User>('/users', data);
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<void> {
    return apiClient.put<void>(`/users/${id}`, data);
  }
}

export const userService = new UserService();
