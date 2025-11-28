import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/api.types";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const data = await productService.getCatalogProduct(productId);
      setProduct(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar produto"
      );
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    loadProduct(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho`);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (
      newQuantity >= 1 &&
      (!product?.quantity || newQuantity <= product.quantity)
    ) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="mt-25 container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return null;
  }

  const maxQuantity = product.quantity ?? 99;
  const inStock = !product.quantity || product.quantity > 0;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-50 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {product.productImage ? (
                <img
                  src={product.productImage}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-lg">
                    Sem imagem
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              )}

              <div className="text-3xl font-bold text-primary mb-4">
                R$ {product.price.toFixed(2)}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {inStock ? (
                    <>
                      {product.quantity && (
                        <p className="text-sm text-muted-foreground">
                          Estoque disponível: {product.quantity} unidades
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">
                          Quantidade:
                        </label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= maxQuantity}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Adicionar ao Carrinho
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-destructive font-medium">
                        Produto sem estoque
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
