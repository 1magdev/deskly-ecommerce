export interface Product extends Record<string, unknown> {
  id?: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  quantity: number;
  productImage?: string;
  active?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  message?: string;
  errors?: FieldError[];
  status?: number;
}

class ApiService {
  private baseUrl = 'http://localhost:8080';
  private token: string | null = null;

  constructor() {
    // Carregar token do localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      // Tratamento de respostas sem conteúdo (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw this.handleError(response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Não foi possível conectar ao servidor');
      }
      throw error;
    }
  }

  private handleError(status: number, data: ErrorResponse): Error {
    // Tratar erros de validação do Spring Boot
    if (status === 400 && data.errors) {
      const messages = data.errors.map((err) => `${err.field}: ${err.message}`);
      return new Error(messages.join('\n'));
    }

    // Mensagens de erro amigáveis baseadas no status
    const errorMessages: Record<number, string> = {
      400: data.message || 'Dados inválidos',
      401: 'Não autorizado. Faça login novamente.',
      403: 'Você não tem permissão para realizar esta ação',
      404: 'Recurso não encontrado',
      409: data.message || 'Conflito ao processar a requisição',
      500: 'Erro no servidor. Tente novamente mais tarde.',
    };

    return new Error(errorMessages[status] || data.message || 'Erro desconhecido');
  }

  // Produtos
  async getProducts(
    page: number = 0,
    size: number = 10,
    search?: string
  ): Promise<PageResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    return this.request<PageResponse<Product>>(`/products?${params.toString()}`);
  }

  async getProductById(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: Product): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Product): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleProductStatus(id: number, active: boolean): Promise<void> {
    return this.request<void>(`/products/${id}/status?active=${active}`, {
      method: 'PATCH',
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }
}

// Exportar instância singleton
export const apiService = new ApiService();
