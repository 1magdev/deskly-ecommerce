import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { setAuthErrorCallback } from '@/lib/error-handler';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api.types';

interface AuthContextData {
  isAuthenticated: boolean;
  token: string | null;
  userEmail: string | null;
  userRole: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  checkPermission: (requiredRole: string | string[]) => boolean;
  isAdmin: () => boolean;
  isEstoquista: () => boolean;
  isCustomer: () => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState({
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
      // Não marcar o usuário como autenticado automaticamente após registro.
      setAuthState((prev) => ({ ...prev, isLoading: false }));
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
    return authState.userRole === 'ESTOQUISTA';
  };

  const isCustomer = (): boolean => {
    return authState.userRole === 'CUSTOMER';
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        checkPermission,
        isAdmin,
        isEstoquista,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
