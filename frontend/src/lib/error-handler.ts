import type { ErrorResponse } from '@/types/api.types';

export class ApiError extends Error {
  status: number;
  error: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Record<string, string>;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = 'ApiError';
    this.status = errorResponse.status;
    this.error = errorResponse.error;
    this.path = errorResponse.path;
    this.timestamp = errorResponse.timestamp;
    this.validationErrors = errorResponse.errors;
  }

  /**
   * Retorna uma mensagem formatada dos erros de validação
   */
  getValidationErrorsMessage(): string {
    if (!this.validationErrors) return this.message;

    const errors = Object.entries(this.validationErrors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');

    return errors || this.message;
  }

  /**
   * Verifica se é um erro de autenticação
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Verifica se é um erro de permissão
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Verifica se é um erro de validação
   */
  isValidationError(): boolean {
    return this.status === 400 && !!this.validationErrors;
  }

  /**
   * Verifica se é um erro de recurso não encontrado
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }

  /**
   * Verifica se é um erro de conflito
   */
  isConflictError(): boolean {
    return this.status === 409;
  }

  /**
   * Verifica se é um erro de servidor
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Manipula erros de forma consistente
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // Erro de rede ou outro erro JavaScript
    return new ApiError({
      timestamp: new Date().toISOString(),
      status: 0,
      error: 'Network Error',
      message: error.message || 'Não foi possível conectar ao servidor',
      path: ''
    });
  }

  // Erro desconhecido
  return new ApiError({
    timestamp: new Date().toISOString(),
    status: 0,
    error: 'Unknown Error',
    message: 'Ocorreu um erro desconhecido',
    path: ''
  });
}

/**
 * Hook de callback para quando ocorre erro de autenticação
 */
let onAuthErrorCallback: (() => void) | null = null;

export function setAuthErrorCallback(callback: () => void) {
  onAuthErrorCallback = callback;
}

export function triggerAuthErrorCallback() {
  if (onAuthErrorCallback) {
    onAuthErrorCallback();
  }
}
