import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { apiService, type Product } from '@/services/api.service';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    productId?: number;
    currentStatus?: boolean;
    action?: 'toggle' | 'delete';
  }>({
    open: false,
  });

  const fetchProducts = async (page: number, search?: string) => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(page, pagination.pageSize, search);
      setProducts(response.content);
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        pageSize: response.size,
        totalItems: response.totalElements,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(0, searchTerm);
  }, []);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    const timeoutId = setTimeout(() => {
      fetchProducts(0, search);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchTerm);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.productId) return;

    try {
      if (confirmDialog.action === 'delete') {
        await apiService.deleteProduct(confirmDialog.productId);
        toast.success('Produto excluído com sucesso!');
      } else if (confirmDialog.currentStatus !== undefined) {
        await apiService.toggleProductStatus(
          confirmDialog.productId,
          !confirmDialog.currentStatus
        );
        toast.success('Status alterado com sucesso!');
      }
      fetchProducts(pagination.currentPage, searchTerm);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : confirmDialog.action === 'delete'
          ? 'Erro ao excluir produto'
          : 'Erro ao alterar status'
      );
    } finally {
      setConfirmDialog({ open: false });
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'id',
      label: 'Código',
    },
    {
      key: 'name',
      label: 'Nome',
    },
    {
      key: 'quantity',
      label: 'Quantidade',
      render: (product) => (
        <span className="underline">{product.quantity}</span>
      ),
    },
    {
      key: 'price',
      label: 'Valor',
      render: (product) => (
        <span>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(product.price)}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (product) => <StatusBadge active={product.active ?? true} />,
    },
    {
      key: 'actions',
      label: 'Opções',
      render: (product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/backoffice/products/${product.id}/edit`)}
            title="Editar"
            className="hover:text-primary hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setConfirmDialog({
                open: true,
                productId: product.id,
                currentStatus: product.active ?? true,
                action: 'toggle',
              })
            }
            title={product.active ? 'Desativar' : 'Ativar'}
            className="hover:text-yellow-600 hover:bg-yellow-50"
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setConfirmDialog({
                open: true,
                productId: product.id,
                action: 'delete',
              })
            }
            title="Excluir"
            className="hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Lista de Produtos"
        action={
          <Button onClick={() => navigate('/backoffice/products/new')} className="bg-primary">
            Novo Produto
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        pagination={pagination}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        searchPlaceholder="Buscar produtos..."
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.action === 'delete'
            ? 'Excluir Produto'
            : confirmDialog.currentStatus
            ? 'Desativar Produto'
            : 'Ativar Produto'
        }
        description={
          confirmDialog.action === 'delete'
            ? 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.'
            : confirmDialog.currentStatus
            ? 'Tem certeza que deseja desativar este produto?'
            : 'Tem certeza que deseja ativar este produto?'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </div>
  );
}
