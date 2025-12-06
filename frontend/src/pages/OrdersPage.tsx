import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types/api.types";
import { ORDER_STATUS_LABELS } from "@/types/api.types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Calendar, MapPin, DollarSign, Eye, ArrowLeft } from "lucide-react";

export function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar pedidos"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} de ${month} de ${year} às ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8 px-4 mt-20">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto py-8 px-4 mt-20 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Meus Pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">
                Você ainda não realizou nenhum pedido
              </p>
              <Button onClick={() => navigate("/")}>
                Ir para a loja
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Pedido #{order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        R$ {order.totalValue.toFixed(2)}
                      </p>
                      {order.status && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Endereço de entrega */}
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.address.label}
                        </p>
                        <p>
                          {order.address.street}, {order.address.number}
                          {order.address.complement && ` - ${order.address.complement}`}
                        </p>
                        <p>
                          {order.address.district} - {order.address.city}/{order.address.state}
                        </p>
                        <p>CEP: {order.address.zipCode}</p>
                      </div>
                    </div>

                    {/* Itens do pedido */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-semibold">
                              R$ {item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resumo */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>
                          R$ {(order.totalValue - order.shippingValue).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Frete:
                        </span>
                        <span>R$ {order.shippingValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span className="text-primary">
                          R$ {order.totalValue.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Botão ver detalhes */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/pedido/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

