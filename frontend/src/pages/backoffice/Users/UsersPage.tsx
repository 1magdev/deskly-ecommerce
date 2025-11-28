import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user.service";
import type { User } from "@/types/api.types";
import { Pencil, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId?: number;
    currentStatus?: boolean;
  }>({
    open: false,
  });

  const sortUsers = (data: User[], key: string, direction: "asc" | "desc") => {
    return [...data].sort((a, b) => {
      const aValue = a[key as keyof User];
      const bValue = b[key as keyof User];

      // Tratamento especial para valores numéricos
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Tratamento para booleanos
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return direction === "asc"
          ? aValue === bValue
            ? 0
            : aValue
            ? 1
            : -1
          : aValue === bValue
          ? 0
          : aValue
          ? -1
          : 1;
      }

      // Tratamento para strings
      const aStr = String(aValue || "").toLowerCase();
      const bStr = String(bValue || "").toLowerCase();

      if (direction === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getBackofficeUsers();
      const sortedUsers = sortUsers(data, sortKey, sortDirection);
      setUsers(sortedUsers);
      setPagination({
        currentPage: 0,
        totalPages: 1,
        pageSize: data.length,
        totalItems: data.length,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar usuários"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    const sortedUsers = sortUsers(users, key, direction);
    setUsers(sortedUsers);
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmDialog.userId || confirmDialog.currentStatus === undefined)
      return;

    try {
      await userService.toggleUserStatus(
        confirmDialog.userId,
        !confirmDialog.currentStatus
      );
      toast.success("Status alterado com sucesso!");
      fetchUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao alterar status"
      );
    } finally {
      setConfirmDialog({ open: false });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: Column<User>[] = [
    {
      key: "id",
      label: "Código",
    },
    {
      key: "fullname",
      label: "Nome",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "cpf",
      label: "CPF",
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {user.role}
        </span>
      ),
    },
    {
      key: "active",
      label: "Status",
      render: (user) => <StatusBadge active={user.active} />,
    },
    {
      key: "actions",
      label: "Opções",
      sortable: false,
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/backoffice/users/${user.id}/edit`)}
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
                userId: user.id,
                currentStatus: user.active,
              })
            }
            title={user.active ? "Desativar" : "Ativar"}
            className="hover:text-yellow-600 hover:bg-yellow-50"
          >
            <Power className="h-4 w-4" />
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
          <Button
            onClick={() => navigate("/backoffice/users/new")}
            className="bg-primary"
          >
            Novo Usuário
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPageChange={() => {}}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
        searchPlaceholder="Buscar usuários..."
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.currentStatus ? "Desativar Usuário" : "Ativar Usuário"
        }
        description={
          confirmDialog.currentStatus
            ? "Tem certeza que deseja desativar este usuário?"
            : "Tem certeza que deseja ativar este usuário?"
        }
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setConfirmDialog({ open: false })}
      />
    </div>
  );
}
