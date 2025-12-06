import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { orderService } from "@/services/order.service";
import type { Order } from "@/types/api.types";
import { ORDER_STATUS_LABELS } from "@/types/api.types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Calendar, MapPin, DollarSign, ArrowLeft, CheckCircle } from "lucide-react";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (id) {
      loadOrder(parseInt(id));
    }
  }, [id, isAuthenticated, navigate]);

  const loadOrder = async (orderId: number) => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar pedido"
      );
      navigate("/pedidos");
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
        <div className="container mx-auto py-8 px-4 mt-20 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  if (!order) {
    return (
      <PublicLayout>
        <div className="container mx-auto py-8 px-4 mt-20 max-w-4xl">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-600">Pedido não encontrado</p>
              <Button onClick={() => navigate("/pedidos")} className="mt-4">
                Voltar para Meus Pedidos
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto py-8 px-4 mt-20 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pedidos")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Detalhes do Pedido #{order.id}</h1>
        </div>

        <Card>
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
                <p className="text-3xl font-bold text-primary">
                  R$ {order.totalValue.toFixed(2)}
                </p>
                {order.status && (
                  <span className="inline-block mt-2 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Endereço de entrega */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Endereço de Entrega
                </h3>
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <p className="font-medium text-gray-900 mb-1">
                      {order.address.label}
                    </p>
                    <p className="text-gray-600">
                      {order.address.street}, {order.address.number}
                      {order.address.complement && ` - ${order.address.complement}`}
                    </p>
                    <p className="text-gray-600">
                      {order.address.district} - {order.address.city}/{order.address.state}
                    </p>
                    <p className="text-gray-600">CEP: {order.address.zipCode}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Itens do pedido */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Itens do Pedido</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-lg mb-1">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantidade: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Preço unitário: R$ {item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              R$ {item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Resumo financeiro */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Resumo Financeiro
                </h3>
                <Card className="bg-primary/5">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Subtotal dos produtos:</span>
                      <span className="font-semibold">
                        R$ {(order.totalValue - order.shippingValue).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-700">Frete:</span>
                      <span className="font-semibold">
                        R$ {order.shippingValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        R$ {order.totalValue.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status do pedido */}
              {order.status && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Status do Pedido</p>
                    <p className="text-sm text-blue-700">{ORDER_STATUS_LABELS[order.status]}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate("/pedidos")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Meus Pedidos
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

