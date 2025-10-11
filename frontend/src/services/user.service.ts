import { apiClient } from '@/lib/api-client';
import type {
  User,
  RegisterRequest,
  UpdateUserRequest
} from '@/types/api.types';

class UserService {
  /**
   * Lista todos os usuários
   */
  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  }

  /**
   * Cria um novo usuário (admin apenas)
   */
  async createUser(data: RegisterRequest): Promise<User> {
    return apiClient.post<User>('/users', data);
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<void> {
    return apiClient.put<void>(`/users/${id}`, data);
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }
}

export const userService = new UserService();
