import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { setAuthErrorCallback } from '@/lib/error-handler';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api.types';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
  userRole: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: authService.isAuthenticated(),
    token: authService.getToken(),
    userEmail: authService.getUserEmail(),
    userRole: authService.getUserRole(),
    isLoading: false,
  });

  useEffect(() => {
    // Configura callback para quando ocorrer erro de autenticação
    setAuthErrorCallback(() => {
      handleLogout();
    });

    // Verifica se o token está expirado
    if (authState.isAuthenticated && authService.isTokenExpired()) {
      handleLogout();
    }
  }, []);

  const updateAuthState = (response?: AuthResponse) => {
    if (response) {
      setAuthState({
        isAuthenticated: true,
        token: response.token,
        userEmail: response.email,
        userRole: response.role,
        isLoading: false,
      });
    } else {
      setAuthState({
        isAuthenticated: authService.isAuthenticated(),
        token: authService.getToken(),
        userEmail: authService.getUserEmail(),
        userRole: authService.getUserRole(),
        isLoading: false,
      });
    }
  };

  const handleLogin = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.login(credentials);
      updateAuthState(response);
      return response;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authService.register(data);
      updateAuthState(response);
      return response;
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      token: null,
      userEmail: null,
      userRole: null,
      isLoading: false,
    });
  };

  const checkPermission = (requiredRole: string | string[]): boolean => {
    if (!authState.userRole) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(authState.userRole);
    }

    return authState.userRole === requiredRole;
  };

  const isAdmin = (): boolean => {
    return authState.userRole === 'ADMIN';
  };

  const isEstoquista = (): boolean => {
    return authState.userRole === 'BACKOFFICE';
  };

  const isCustomer = (): boolean => {
    return authState.userRole === 'CUSTOMER';
  };

  return {
    ...authState,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkPermission,
    isAdmin,
    isEstoquista,
    isCustomer,
  };
}
