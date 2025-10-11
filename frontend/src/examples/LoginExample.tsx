import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError, handleApiError } from '@/lib/error-handler';

/**
 * Exemplo de componente de Login com tratamento de erros
 */
export function LoginExample() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    try {
      await login({ email, password });
      // Redirecionar para dashboard ou página inicial
      console.log('Login bem-sucedido!');
    } catch (err) {
      const apiError = handleApiError(err);

      // Se for erro de validação, exibe erros por campo
      if (apiError.isValidationError() && apiError.validationErrors) {
        setValidationErrors(apiError.validationErrors);
        setError('Por favor, corrija os erros abaixo.');
      } else {
        // Outros tipos de erro
        setError(apiError.message);
      }

      // Log detalhado do erro (apenas em dev)
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro no login:', apiError);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Erro geral */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Campo Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Campo Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
            disabled={isLoading}
          />
          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
          )}
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
