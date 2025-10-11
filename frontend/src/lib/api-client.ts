import type { ErrorResponse } from "@/types/api.types";
import { ApiError, triggerAuthErrorCallback } from "./error-handler";

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = "http://localhost:8080") {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Método genérico para fazer requisições HTTP
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...this.getDefaultHeaders(options),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        // Se for erro de autenticação, dispara callback
        if (error.isAuthError()) {
          this.clearToken();
          triggerAuthErrorCallback();
        }
        throw error;
      }

      // Erro de rede
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        throw new ApiError({
          timestamp: new Date().toISOString(),
          status: 0,
          error: "Network Error",
          message:
            "Não foi possível conectar ao servidor. Verifique sua conexão.",
          path: endpoint,
        });
      }

      throw error;
    }
  }

  /**
   * Requisição GET
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  /**
   * Requisição POST
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requisição PUT
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requisição PATCH
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * Requisição com FormData (para upload de arquivos)
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    // Não define Content-Type, deixa o navegador definir com boundary
    const headers: Record<string, string> = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError()) {
        this.clearToken();
        triggerAuthErrorCallback();
      }
      throw error;
    }
  }

  /**
   * Requisição PUT com FormData
   */
  async putFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers,
        body: formData,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError()) {
        this.clearToken();
        triggerAuthErrorCallback();
      }
      throw error;
    }
  }

  /**
   * Retorna headers padrão baseado no tipo de requisição
   */
  private getDefaultHeaders(options: RequestInit): Record<string, string> {
    // Se tem body e não é FormData, adiciona Content-Type: application/json
    if (options.body && typeof options.body === "string") {
      return { "Content-Type": "application/json" };
    }
    return {};
  }

  /**
   * Processa a resposta HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Resposta sem conteúdo (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Tenta fazer parse do JSON
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      // Se não conseguir fazer parse, retorna objeto vazio
      if (response.ok) {
        return {} as T;
      }

      // Se não for ok e não tem JSON, lança erro genérico
      throw new ApiError({
        timestamp: new Date().toISOString(),
        status: response.status,
        error: response.statusText,
        message: "Erro ao processar resposta do servidor",
        path: response.url,
      });
    }

    // Se a resposta não for ok, lança erro
    if (!response.ok) {
      throw new ApiError(data as ErrorResponse);
    }

    return data as T;
  }
}

// Instância singleton
export const apiClient = new ApiClient();
