import { useState, useEffect } from 'react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/api.types';
import { ApiError, handleApiError } from '@/lib/error-handler';

/**
 * Exemplo de componente de listagem de produtos com tratamento de erros
 */
export function ProductListExample() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await productService.getProducts({
        page,
        size: 10,
        search: search || undefined,
      });

      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      const apiError = handleApiError(err);

      // Tratamento específico por tipo de erro
      if (apiError.isAuthError()) {
        setError('Sua sessão expirou. Por favor, faça login novamente.');
      } else if (apiError.isForbiddenError()) {
        setError('Você não tem permissão para visualizar produtos.');
      } else if (apiError.isServerError()) {
        setError('Erro no servidor. Tente novamente mais tarde.');
      } else {
        setError(apiError.message);
      }

      // Log para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao carregar produtos:', apiError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    try {
      await productService.toggleProductStatus(productId, !currentStatus);

      // Atualiza o produto na lista local
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, active: !currentStatus } : p
        )
      );
    } catch (err) {
      const apiError = handleApiError(err);
      alert(`Erro ao atualizar status: ${apiError.message}`);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Tem certeza que deseja desativar este produto?')) {
      return;
    }

    try {
      await productService.deactivateProduct(productId);

      // Atualiza a lista
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, active: false } : p
        )
      );
    } catch (err) {
      const apiError = handleApiError(err);

      // Tratamento específico
      if (apiError.isNotFoundError()) {
        alert('Produto não encontrado.');
      } else if (apiError.isForbiddenError()) {
        alert('Você não tem permissão para desativar produtos.');
      } else {
        alert(`Erro: ${apiError.message}`);
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
          <button
            onClick={loadProducts}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>

      {/* Campo de busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0); // Reseta para primeira página ao buscar
          }}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      {/* Lista de produtos */}
      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum produto encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600">
                  R$ {product.price.toFixed(2)}
                </p>
                <span
                  className={`text-sm ${
                    product.active ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleToggleStatus(product.id, product.active)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  {product.active ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
