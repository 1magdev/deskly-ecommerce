import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faMapMarkerAlt,
  faCreditCard,
  faCheckCircle,
  faPlus,
  faBarcode,
} from "@fortawesome/free-solid-svg-icons";
import { cartService } from "@/services/cart.service";
import { addressService } from "@/services/address.service";
import type { Cart, Address, PaymentRequest } from "@/types/api.types";
import { toast } from "sonner";

type CheckoutStep = "cart" | "address" | "payment" | "confirmation";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<"BOLETO" | "CARD">("CARD");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolderName: "",
    cardExpiration: "",
    cardCvv: "",
    installments: 1,
  });

  // Address form state
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
  });

  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.checkout();
      setCart(cartData);

      if (cartData.items.length === 0) {
        toast.error("Seu carrinho está vazio");
        navigate("/cart");
        return;
      }

      const addressList = await cartService.getDeliveryAddresses();
      setAddresses(addressList);

      if (cartData.deliveryAddress) {
        setSelectedAddressId(cartData.deliveryAddress.id);
        setCurrentStep("payment");
      } else if (addressList.length > 0) {
        setCurrentStep("address");
      } else {
        setCurrentStep("address");
        setShowAddressForm(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao inicializar checkout");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelection = async () => {
    if (!selectedAddressId) {
      toast.error("Selecione um endereço de entrega");
      return;
    }

    try {
      setLoading(true);
      const updatedCart = await cartService.selectDeliveryAddress({
        addressId: selectedAddressId,
      });
      setCart(updatedCart);
      await cartService.validateDeliveryAddress();
      setCurrentStep("payment");
      toast.success("Endereço selecionado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao selecionar endereço");
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

  const handlePaymentSelection = async () => {
    try {
      setLoading(true);

      const paymentData: PaymentRequest = {
        method: paymentMethod,
      };

      if (paymentMethod === "CARD") {
        paymentData.cardNumber = cardData.cardNumber;
        paymentData.cardHolderName = cardData.cardHolderName;
        paymentData.cardExpiration = cardData.cardExpiration;
        paymentData.cardCvv = cardData.cardCvv;
        paymentData.installments = cardData.installments;
      }

      const updatedCart = await cartService.selectPayment(paymentData);
      setCart(updatedCart);
      await cartService.validatePayment();
      setCurrentStep("confirmation");
      toast.success("Pagamento configurado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao configurar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "cart", label: "Carrinho", icon: faShoppingCart },
    { id: "address", label: "Endereço", icon: faMapMarkerAlt },
    { id: "payment", label: "Pagamento", icon: faCreditCard },
    { id: "confirmation", label: "Confirmação", icon: faCheckCircle },
  ];

  const getStepIndex = (step: CheckoutStep) => steps.findIndex((s) => s.id === step);

  if (loading && !cart) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-25">
          <p className="text-xl">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32 px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        getStepIndex(currentStep) >= index
                          ? "bg-primary text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      <FontAwesomeIcon icon={step.icon} />
                    </div>
                    <span className="text-sm mt-2 font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        getStepIndex(currentStep) > index ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary - Always visible */}
          {cart && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Frete:</span>
                      <span>R$ {cart.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Total:</span>
                      <span>R$ {cart.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address Step */}
          {currentStep === "address" && (
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
                      onClick={handleAddressSelection}
                      disabled={!selectedAddressId || loading}
                    >
                      Continuar para Pagamento
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
          )}

          {/* Payment Step */}
          {currentStep === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "BOLETO" | "CARD")}
                  className="mb-6"
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="CARD" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCreditCard} />
                        <span className="font-medium">Cartão de Crédito</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="BOLETO" id="boleto" />
                    <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBarcode} />
                        <span className="font-medium">Boleto Bancário</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "CARD" && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label>Número do Cartão</Label>
                      <Input
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardNumber: e.target.value })
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                      />
                    </div>
                    <div>
                      <Label>Nome do Titular</Label>
                      <Input
                        value={cardData.cardHolderName}
                        onChange={(e) =>
                          setCardData({ ...cardData, cardHolderName: e.target.value })
                        }
                        placeholder="Como está no cartão"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Validade</Label>
                        <Input
                          value={cardData.cardExpiration}
                          onChange={(e) =>
                            setCardData({ ...cardData, cardExpiration: e.target.value })
                          }
                          placeholder="MM/AA"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input
                          value={cardData.cardCvv}
                          onChange={(e) =>
                            setCardData({ ...cardData, cardCvv: e.target.value })
                          }
                          placeholder="000"
                          maxLength={4}
                          required
                        />
                      </div>
                      <div>
                        <Label>Parcelas</Label>
                        <select
                          className="w-full border rounded-md p-2"
                          value={cardData.installments}
                          onChange={(e) =>
                            setCardData({ ...cardData, installments: Number(e.target.value) })
                          }
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                            <option key={i} value={i}>
                              {i}x
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("address")}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handlePaymentSelection}
                    disabled={loading}
                    className="flex-1"
                  >
                    Finalizar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation Step */}
          {currentStep === "confirmation" && cart && (
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
                        <strong>Endereço de Entrega:</strong>
                      </p>
                      {cart.deliveryAddress && (
                        <div className="text-sm text-gray-600">
                          {cart.deliveryAddress.street}, {cart.deliveryAddress.number}
                          <br />
                          {cart.deliveryAddress.district} - {cart.deliveryAddress.city}/
                          {cart.deliveryAddress.state}
                        </div>
                      )}
                      <p className="mt-4">
                        <strong>Forma de Pagamento:</strong> {cart.paymentMethod}
                      </p>
                      {cart.paymentMethod === "CARD" && (
                        <p className="text-sm text-gray-600">
                          {cart.paymentCardBrand} **** {cart.paymentCardLastDigits} -{" "}
                          {cart.paymentInstallments}x
                        </p>
                      )}
                      <p className="mt-4">
                        <strong>Total:</strong> R$ {cart.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/")} size="lg">
                    Voltar para a Loja
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
