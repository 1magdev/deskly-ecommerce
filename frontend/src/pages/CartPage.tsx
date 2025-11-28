import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faMinus,
  faPlus,
  faTruck,
  faBolt,
  faInfoCircle,
  faMoneyCheckDollar,
  faMoneyBill,
  faDollar,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useState } from "react";

type ShippingType = "normal" | "express" | "economico";

interface ShippingOption {
  type: ShippingType;
  label: string;
  price: number;
  estimatedDays: string;
  icon: any;
}

const shippingOptions: ShippingOption[] = [
  {
    type: "normal",
    label: "Frete Normal",
    price: 15.9,
    estimatedDays: "5-7 dias úteis",
    icon: faTruck,
  },
  {
    type: "economico",
    label: "Frete Economico",
    price: 8.9,
    estimatedDays: "7-10 dias úteis",
    icon: faDollar,
  },
  {
    type: "express",
    label: "Frete Expresso",
    price: 29.9,
    estimatedDays: "1-2 dias úteis",
    icon: faBolt,
  },
];

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, getItemCount } =
    useCart();
  const { isAuthenticated } = useAuth();
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingType>("normal");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost =
    shippingOptions.find((option) => option.type === selectedShipping)?.price ||
    0;

  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-25">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Seu carrinho está vazio</h1>
            <p className="text-gray-600 mb-8">
              Adicione produtos para continuar comprando
            </p>
            <Link to="/">
              <Button size="lg">Ir para a loja</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="top-25 bg-primary flex items-center justify-center">
        <img
          src="branding/cart-promotional-session.png"
          alt="Promotional Art"
          className="h-100 mt-5"
        />
      </div>
      <div className="min-h-screen bg-gray-50 pt-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">
              Carrinho ({getItemCount()} itens)
            </h1>
            <Button variant="outline" onClick={clearCart}>
              Limpar carrinho
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <CardContent className="flex gap-4 p-0">
                    <div
                      className="w-32 h-32 bg-cover bg-center bg-no-repeat rounded-lg"
                      style={{ backgroundImage: `url(${item.productImage})` }}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-4">
                        {item.name}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="col-span-1">
              <Card className="p-6 sticky top-32">
                <CardTitle className="text-2xl mb-6">
                  Resumo do pedido
                </CardTitle>
                <CardContent className="p-0 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 text-lg">
                      Opções de Frete
                    </h3>
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.type}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedShipping === option.type
                              ? "border-primary bg-primary/5 ring-2 ring-primary"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedShipping(option.type)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 ${
                                  selectedShipping === option.type
                                    ? "text-primary"
                                    : "text-gray-400"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={option.icon}
                                  className="text-xl"
                                />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {option.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {option.estimatedDays}
                                </div>
                              </div>
                            </div>
                            <div className="font-semibold">
                              {option.price === 0 ? (
                                <span className="text-green-600">Grátis</span>
                              ) : (
                                <span>R$ {option.price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-0 mt-6 flex-col gap-4">
                  {!isAuthenticated && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="text-blue-600 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-blue-800">
                        Você precisa estar logado para finalizar a compra.
                      </p>
                    </div>
                  )}
                  <Link to="/checkout" className="w-full">
                    <Button size="lg" className="w-full">
                      Finalizar compra
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
