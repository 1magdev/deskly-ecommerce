import { useState, useEffect } from "react";
import { orderService } from "@/services/order.service";
import type { Order, PageResponse, OrderStatus } from "@/types/api.types";
import { ORDER_STATUS_LABELS } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGAMENTO_REJEITADO: "bg-red-100 text-red-800",
  PAGAMENTO_APROVADO: "bg-green-100 text-green-800",
  AGUARDANDO_RETIRADA: "bg-blue-100 text-blue-800",
  EM_TRANSITO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-200 text-green-900",
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const loadOrders = async (currentPage: number = 0) => {
    try {
      setLoading(true);
      const response: PageResponse<Order> =
        await orderService.getAllOrdersForBackoffice(currentPage, 10);
      setOrders(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(currentPage);
    } catch (error) {
      toast.error("Erro ao carregar pedidos");
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatus
  ) => {
    try {
      setUpdatingStatus(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success("Status atualizado com sucesso!");
      loadOrders(page);
    } catch (error) {
      toast.error("Erro ao atualizar status");
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
          <p className="text-gray-600">
            Visualize e gerencie todos os pedidos do sistema
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
        <p className="text-gray-600">
          Visualize e gerencie todos os pedidos do sistema ({totalElements}{" "}
          pedidos)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    {order.address.city}, {order.address.state}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(order.totalValue)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleStatusChange(order.id, value as OrderStatus)
                      }
                      disabled={updatingStatus === order.id}
                    >
                      <SelectTrigger className="w-[200px] bg-white">
                        <SelectValue placeholder="Alterar status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="AGUARDANDO_PAGAMENTO">
                          Aguardando Pagamento
                        </SelectItem>
                        <SelectItem value="PAGAMENTO_REJEITADO">
                          Pagamento Rejeitado
                        </SelectItem>
                        <SelectItem value="PAGAMENTO_APROVADO">
                          Pagamento Aprovado
                        </SelectItem>
                        <SelectItem value="AGUARDANDO_RETIRADA">
                          Aguardando Retirada
                        </SelectItem>
                        <SelectItem value="EM_TRANSITO">Em Trânsito</SelectItem>
                        <SelectItem value="ENTREGUE">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600">
              Página {page + 1} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadOrders(page - 1)}
                disabled={page === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadOrders(page + 1)}
                disabled={page >= totalPages - 1 || loading}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
