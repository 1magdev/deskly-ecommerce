import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faPlus } from "@fortawesome/free-solid-svg-icons";
import { addressService } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { useCart } from "@/contexts/CartContext";
import type { Address } from "@/types/api.types";
import { toast } from "sonner";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const [newAddress, setNewAddress] = useState({
    label: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryAddress: true,
    paymentAddress: true,
  });

  const shippingValue = 15.0;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingValue;

  useEffect(() => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      navigate("/cart");
      return;
    }
    loadAddresses();
  }, [items, navigate]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const addressList = await addressService.getMyAddresses();
      setAddresses(addressList);

      if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      } else {
        setShowAddressForm(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar endereços");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const createdAddress = await addressService.createAddress(newAddress);
      setAddresses([...addresses, createdAddress]);
      setSelectedAddressId(createdAddress.id);
      setShowAddressForm(false);
      toast.success("Endereço cadastrado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar endereço");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Selecione um endereço de entrega");
      return;
    }

    try {
      setLoading(true);

      const orderRequest = {
        shippingValue,
        addressId: selectedAddressId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const order = await orderService.createOrder(orderRequest);
      setCreatedOrderId(order.id);
      setOrderCreated(true);
      clearCart();
      toast.success("Pedido criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  if (loading && addresses.length === 0 && !showAddressForm) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-25">
          <p className="text-xl">Carregando...</p>
        </div>
      </>
    );
  }

  if (orderCreated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-32 px-8 pb-16">
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl text-green-600">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Pedido Confirmado!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-lg">Obrigado pela sua compra!</p>
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Detalhes do Pedido</h3>
                    <div className="text-left space-y-2">
                      <p>
                        <strong>Número do Pedido:</strong> #{createdOrderId}
                      </p>
                      <p>
                        <strong>Total:</strong> R$ {total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate("/orders")} size="lg">
                      Ver Meus Pedidos
                    </Button>
                    <Button onClick={() => navigate("/")} size="lg" variant="outline">
                      Voltar para a Loja
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32 px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Frete:</span>
                    <span>R$ {shippingValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selecione o Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              {!showAddressForm ? (
                <>
                  <RadioGroup
                    value={selectedAddressId?.toString()}
                    onValueChange={(value) => setSelectedAddressId(Number(value))}
                  >
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-2 border p-4 rounded-lg mb-2"
                      >
                        <RadioGroupItem value={address.id.toString()} id={`addr-${address.id}`} />
                        <Label htmlFor={`addr-${address.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">{address.label}</div>
                          <div className="text-sm text-gray-600">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.district} - {address.city}/{address.state}
                          </div>
                          <div className="text-sm text-gray-600">CEP: {address.zipCode}</div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setShowAddressForm(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Adicionar Novo Endereço
                  </Button>

                  <Button
                    className="w-full mt-4"
                    onClick={handleCreateOrder}
                    disabled={!selectedAddressId || loading}
                  >
                    {loading ? "Processando..." : "Confirmar Pedido"}
                  </Button>
                </>
              ) : (
                <form onSubmit={handleCreateAddress} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Nome do Endereço (ex: Casa, Trabalho)</Label>
                      <Input
                        value={newAddress.label}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, label: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>CEP</Label>
                      <Input
                        value={newAddress.zipCode}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, zipCode: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Rua</Label>
                      <Input
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, street: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Número</Label>
                      <Input
                        value={newAddress.number}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, number: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Complemento</Label>
                      <Input
                        value={newAddress.complement}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, complement: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Bairro</Label>
                      <Input
                        value={newAddress.district}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, district: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Input
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, state: e.target.value })
                        }
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1"
                      disabled={addresses.length === 0}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      Salvar Endereço
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
