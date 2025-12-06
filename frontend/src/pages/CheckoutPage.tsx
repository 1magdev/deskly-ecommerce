import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addressService } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { useCart } from "@/contexts/CartContext";
import type { Address, PaymentMethod } from "@/types/api.types";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { MapPin, Plus, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [newAddress, setNewAddress] = useState<boolean | Address>(false);
  const [editingAddress, setEditingAddress] = useState<Address | boolean>(
    false
  );
  const [loadingAddress, setLoadingAddress] = useState(true);

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
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingValue;

  const updateField = (field: keyof Address, value: any) => {
    if (typeof editingAddress !== "boolean" && editingAddress) {
      setEditingAddress({
        ...editingAddress,
        [field]: value,
      });
    } else if (typeof newAddress !== "boolean") {
      setNewAddress({
        ...newAddress,
        [field]: value,
      });
    }
  };

  const handleFetchCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    updateField("zipCode", cep);

    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (!data.erro) {
        if (typeof editingAddress !== "boolean" && editingAddress) {
          setEditingAddress({
            ...editingAddress,
            street: data.logradouro || "",
            district: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
            faturamentoAddress: false,
          });
        } else if (typeof newAddress !== "boolean") {
          setNewAddress({
            ...newAddress,
            street: data.logradouro || "",
            district: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
            faturamentoAddress: false,
          });
        }
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddress(true);
      const addressList = await addressService.getMyAddresses();
      setAddresses(addressList);

      if (addressList.length > 0) {
        const principal =
          addressList.find((a) => a.deliveryAddress) ?? addressList[0];
        setSelectedAddressId(principal.id);
      } else {
        setSelectedAddressId(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar endereços");
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio");
      navigate("/cart");
      return;
    }
    fetchAddresses();
  }, [items, navigate]);

  const handleAddAddress = () => {
    setEditingAddress(false);
    setNewAddress({
      label: "",
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      deliveryAddress: false,
    } as Address);
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(false);
    setEditingAddress(address);
  };

  const handleCancelEdit = () => {
    setEditingAddress(false);
    setNewAddress(false);
  };

  const handleSubmit = async (type: "insert" | "edit") => {
    setLoadingAddress(true);
    switch (type) {
      case "insert":
        if (typeof newAddress === "boolean") return;

        try {
          await addressService.createAddress(newAddress);
          toast.success("Endereço criado com sucesso!");
          setNewAddress(false);
          await fetchAddresses();
        } catch (err) {
          console.error(err);
          toast.error("Erro ao criar endereço.");
        }
        break;
      case "edit":
        if (typeof editingAddress === "boolean") return;

        try {
          await addressService.updateAddress(
            editingAddress.id,
            editingAddress
          );
          toast.success("Endereço atualizado com sucesso!");
          setEditingAddress(false);
          await fetchAddresses();
        } catch (err) {
          console.error(err);
          toast.error("Erro ao atualizar endereço.");
        }
        break;
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Selecione um endereço de entrega");
      return;
    }

    if (paymentMethod === "CREDIT_CARD") {
      if (!cardData.cardHolderName || !cardData.cardNumber || !cardData.cardExpiryMonth || !cardData.cardExpiryYear || !cardData.cardCvv) {
        toast.error("Preencha todos os dados do cartão");
        return;
      }

      if (cardData.cardNumber.replace(/\s/g, "").length !== 16) {
        toast.error("Número do cartão deve ter 16 dígitos");
        return;
      }

      if (cardData.cardCvv.length !== 3) {
        toast.error("CVV deve ter 3 dígitos");
        return;
      }
    }

    try {
      setLoading(true);

      const orderRequest = {
        shippingValue,
        addressId: selectedAddressId,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        ...(paymentMethod === "CREDIT_CARD" && {
          cardHolderName: cardData.cardHolderName,
          cardNumber: cardData.cardNumber.replace(/\s/g, ""),
          cardExpiryMonth: cardData.cardExpiryMonth,
          cardExpiryYear: cardData.cardExpiryYear,
          cardCvv: cardData.cardCvv,
        }),
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

  const renderAddressForm = (address: Address, isEditing: boolean) => {
    const currentAddress = isEditing ? editingAddress : newAddress;
    if (typeof currentAddress === "boolean") return null;

    return (
      <div
        className={`p-4 rounded-lg border-2 ${
          isEditing
            ? "border-orange-500 bg-orange-50"
            : "border-primary bg-primary/5"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MapPin
              className={`h-5 w-5 ${
                isEditing ? "text-orange-500" : "text-primary"
              }`}
            />
            {isEditing && <span className="text-orange-600">Editando: </span>}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none font-semibold`}
              placeholder="Rótulo"
              value={currentAddress.label}
              onChange={(e) => updateField("label", e.target.value)}
            />
          </h3>

        </div>

        <div className="grid md:grid-cols-2 gap-3 text-sm">
          
        <label className="m-2 text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentAddress.faturamentoAddress}
              onChange={() =>
                updateField("faturamentoAddress", !currentAddress.faturamentoAddress)
              }
            />
            Endereço de faturamento
          </label>
          <div className="text-gray-700">
            <span className="font-medium">CEP:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2`}
              placeholder="CEP"
              value={currentAddress.zipCode}
              onChange={(e) => handleFetchCEP(e.target.value)}
            />
          </div>

          <div className="text-gray-700">
            <span className="font-medium">Cidade/UF:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2 w-24`}
              placeholder="Cidade"
              value={currentAddress.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
            /
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-1 w-12`}
              placeholder="UF"
              maxLength={2}
              value={currentAddress.state}
              onChange={(e) =>
                updateField("state", e.target.value.toUpperCase())
              }
            />
          </div>

          <div className="text-gray-700 md:col-span-2">
            <span className="font-medium">Endereço:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2 w-64`}
              placeholder="Rua"
              value={currentAddress.street}
              onChange={(e) => updateField("street", e.target.value)}
            />
            ,
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none w-20 ml-1`}
              placeholder="Nº"
              value={currentAddress.number}
              onChange={(e) => updateField("number", e.target.value)}
            />
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none w-40 ml-1`}
              placeholder="Complemento"
              value={currentAddress.complement || ""}
              onChange={(e) => updateField("complement", e.target.value)}
            />
          </div>

          <div className="text-gray-700">
            <span className="font-medium">Bairro:</span>{" "}
            <input
              className={`bg-transparent border-b ${
                isEditing ? "border-orange-500" : "border-primary"
              } outline-none ml-2`}
              placeholder="Bairro"
              value={currentAddress.district}
              onChange={(e) => updateField("district", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            className={`border-2 ${
              isEditing
                ? "border-orange-500 text-orange-600 hover:bg-orange-500"
                : "border-primary text-primary hover:bg-primary"
            } hover:text-white`}
            onClick={() => handleSubmit(isEditing ? "edit" : "insert")}
          >
            {isEditing ? (
              <Edit className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isEditing ? "Salvar Alterações" : "Salvar Endereço"}
          </Button>
          <Button
            variant="outline"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-600 hover:text-white hover:border-gray-600"
            onClick={handleCancelEdit}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

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
                    <Button
                      onClick={() => navigate("/")}
                      size="lg"
                      variant="outline"
                    >
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

          {/* Resumo do pedido permanece igual */}
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

          {/* Parte de endereços copiada/adaptada do ProfilePage */}
          {!loadingAddress && addresses.length > 0 ? (
            <Card className="border-1 border-primary overflow-hidden mb-4">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Meus Endereços ({addresses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <Button variant="default" onClick={handleAddAddress}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar novo endereço
                  </Button>

                  {newAddress &&
                    typeof newAddress !== "boolean" &&
                    renderAddressForm(newAddress, false)}

                  {addresses.map((address) => {
                    const isEditing =
                      typeof editingAddress !== "boolean" &&
                      editingAddress &&
                      editingAddress.id === address.id;

                    if (isEditing && typeof editingAddress !== "boolean") {
                      return (
                        <div key={address.id}>
                          {renderAddressForm(editingAddress, true)}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={address.id}
                        className={`p-4 rounded-lg border-2 ${
                          address.deliveryAddress
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {address.label}
                          </h3>
                          <div className="flex flex-col items-end gap-1">
                            {address.deliveryAddress && (
                              <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                                Principal
                              </span>
                            )}
                            {selectedAddressId === address.id && (
                              <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                                Selecionado para entrega
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">CEP:</span>{" "}
                            {address.zipCode}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Cidade/UF:</span>{" "}
                            {address.city}/{address.state}
                          </p>
                          <p className="text-gray-700 md:col-span-2">
                            <span className="font-medium">Endereço:</span>{" "}
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Bairro:</span>{" "}
                            {address.district}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button
                            variant="ghost"
                            className="border-2 border-primary mt-2 text-primary hover:bg-primary hover:text-white"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant={
                              selectedAddressId === address.id
                                ? "default"
                                : "outline"
                            }
                            className={
                              selectedAddressId === address.id
                                ? "border-2 border-green-600 bg-green-600 text-white mt-2"
                                : "border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white mt-2"
                            }
                            onClick={() => setSelectedAddressId(address.id)}
                          >
                            {selectedAddressId === address.id
                              ? "Endereço selecionado"
                              : "Usar este endereço"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-1 border-primary overflow-hidden mb-4">
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/6" />
                <div className="flex justify-end pt-2">
                  <Button onClick={handleAddAddress}>
                    <Plus className="mr-2 h-4 w-4" /> Cadastrar primeiro
                    endereço
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full mt-2"
            onClick={handleCreateOrder}
            disabled={!selectedAddressId || loading}
          >
            {loading ? "Processando..." : "Confirmar Pedido"}
          </Button>
        </div>
      </div>
    </>
  );
}
