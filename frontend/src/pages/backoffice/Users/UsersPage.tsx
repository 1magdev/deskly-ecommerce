import { DataTable, type Column } from '@/components/shared/DataTable';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import type { User } from '@/types/api.types';
import { Pencil, Power, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setPagination({
        currentPage: 0,
        totalPages: 1,
        pageSize: data.length,
        totalItems: data.length,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: Column<User>[] = [
    {
      key: 'id',
      label: 'Código',
    },
    {
      key: 'fullname',
      label: 'Nome',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'cpf',
      label: 'CPF',
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {user.role}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (user) => <StatusBadge active={user.active} />,
    },
    {
      key: 'actions',
      label: 'Opções',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Editar"
            className="hover:text-primary hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={user.active ? 'Desativar' : 'Ativar'}
            className="hover:text-yellow-600 hover:bg-yellow-50"
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Excluir"
            className="hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Lista de Usuários"
        action={
          <Button className="bg-primary">
            Novo Usuário
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPageChange={() => {}}
        searchPlaceholder="Buscar usuários..."
      />
    </div>
  );
}
