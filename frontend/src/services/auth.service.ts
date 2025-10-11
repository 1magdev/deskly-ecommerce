import { apiClient } from "@/lib/api-client";
import type{ AuthResponse, LoginRequest, RegisterRequest } from "@/types/api.types";

class AuthService {
  /**
   * Faz login do usuário
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );

    // Salva o token
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  }

  /**
   * Registra um novo usuário
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);

    // Salva o token
    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    apiClient.clearToken();
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  /**
   * Retorna o token atual
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Decodifica o JWT e retorna os dados do payload
   * Nota: Não valida a assinatura, apenas decodifica
   */
  decodeToken(): Record<string, unknown> | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Verifica se o token está expirado
   */
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload || !payload.exp) return true;

    const expirationDate = new Date((payload.exp as number) * 1000);
    return expirationDate < new Date();
  }

  /**
   * Retorna o papel (role) do usuário do token
   */
  getUserRole(): string | null {
    const payload = this.decodeToken();
    return (payload?.role as string) || null;
  }

  /**
   * Retorna o email do usuário do token
   */
  getUserEmail(): string | null {
    const payload = this.decodeToken();
    return (payload?.sub as string) || null;
  }
}

export const authService = new AuthService();
