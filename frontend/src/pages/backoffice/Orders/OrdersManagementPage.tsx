import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { BackofficeLayout } from "@/components/layout/BackofficeLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types/api.types";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => order.id === orderId ? updatedOrder : order));
      toast.success("Status do pedido atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status do pedido");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <BackofficeLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-xl">Carregando pedidos...</p>
        </div>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciamento de Pedidos</h1>
          <Button onClick={loadOrders} variant="outline">
            Atualizar
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Pedido #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.address.street}, {order.address.number}
                          {order.address.complement && ` - ${order.address.complement}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.address.district} - {order.address.city}/{order.address.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CEP: {order.address.zipCode}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Resumo</h3>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>R$ {(order.totalValue - order.shippingValue).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Frete:</span>
                            <span>R$ {order.shippingValue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-1">
                            <span>Total:</span>
                            <span>R$ {order.totalValue.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm bg-muted p-2 rounded">
                            <span>
                              {item.productName} x {item.quantity}
                            </span>
                            <span className="font-medium">R$ {item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <label className="font-semibold">Alterar Status:</label>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        disabled={updatingOrderId === order.id}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                            <SelectItem key={status} value={status}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingOrderId === order.id && (
                        <span className="text-sm text-muted-foreground">Atualizando...</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
