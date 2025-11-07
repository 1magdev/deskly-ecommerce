import { apiClient } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/api.types";

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    if (response.token) apiClient.setToken(response.token);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    if (response.token) apiClient.setToken(response.token);
    return response;
  }

  logout(): void {
    apiClient.clearToken();
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  getToken(): string | null {
    return apiClient.getToken();
  }

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

  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload || !payload.exp) return true;
    const expirationDate = new Date((payload.exp as number) * 1000);
    return expirationDate < new Date();
  }

  getUserRole(): string | null {
    const payload = this.decodeToken();
    return (payload?.role as string) || null;
  }

  getUserEmail(): string | null {
    const payload = this.decodeToken();
    return (payload?.sub as string) || null;
  }
}

export const authService = new AuthService();
