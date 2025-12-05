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
import { ArrowLeft, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const images = product.images && product.images.length > 0
    ? product.images
    : product.productImage
    ? [product.productImage]
    : [];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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
          <div className="space-y-4">
            <Card className="overflow-hidden relative">
              <CardContent className="p-0">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={`${product.name} - Imagem ${currentImageIndex + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={handlePreviousImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={handleNextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full aspect-square bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-lg">
                      Sem imagem
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-primary ring-2 ring-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

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
