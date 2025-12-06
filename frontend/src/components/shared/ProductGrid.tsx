/* eslint-disable @typescript-eslint/no-explicit-any */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";
import type { Product } from "../../types/api.types";

import {
  faArrowRight,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ProductGrid() {
  const [items, setItems] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const catalogRes = await productService.getCatalog({ page: 0, size: 15 });
        // productService.getCatalog pode retornar PageResponse<Product> ou um array direto.
        // Normaliza para Product[].
        const list: Product[] =
          Array.isArray(catalogRes) ? catalogRes : (catalogRes as any)?.content || [];
        console.log("Produtos carregados:", list);
        setItems(list);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="grid grid-cols-4 gap-5 w-full px-25 py-15 bg-gray-300/20">
      {items.length > 0
        ? items.map((product) => (
            <Card key={product.id} className="bg-white border-0 shadow-lg w-75 h-100 flex items-center flex-col relative">
              <CardContent
                className={`top-0 w-64 max-h-50 min-h-50 h-100 overflow-hidden flex items-start justify-center`}
              >
                <img
                  src={product.images && product.images.length > 0 ? product.images[0] : product.productImage}
                  className="p-3"
                  alt={product.name}
                />
              </CardContent>
              <CardFooter className="w-full items-center text-left bg-white py-5 rounded-2xl justify-between gap-2 flex flex-col">
                <CardTitle className="text-xl font-bold w-60 text-center h-15">
                  {product.name}
                </CardTitle>
                <h3 className="text-2xl text-center">
                  <span className="font-bold text-xl text-primary">R$</span>{" "}
                  {product.price.toFixed(2)}
                </h3>
                <div className="flex items-center w-full justify-center">
                  <Button
                    className="text-lg rounded-l-full rounded-r-0 w-full"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FontAwesomeIcon icon={faCartShopping}></FontAwesomeIcon>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-lg rounded-r-full rounded-r-0w-full bg-0 text-primary border-1 outline-primary"
                    onClick={() => navigate(`/produto/${product.id}`)}
                  >
                    Ver detalhes <FontAwesomeIcon icon={faArrowRight} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        : new Array(12).fill(undefined).map((_, index) => (
            <Skeleton key={index} className="h-80 w-80 rounded-xl" />
          ))}
    </div>
  );
}
