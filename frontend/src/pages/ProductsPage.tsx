import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faList, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";
import type { Product, ProductCategory } from "@/types/api.types";
import { PRODUCT_CATEGORIES } from "@/types/api.types";
import { toast } from "sonner";

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(
      searchParams.get("category") as ProductCategory | null
    );

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") as ProductCategory | null;
    setSearchQuery(search);
    setSelectedCategory(category);
  }, [searchParams]);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        page: 0,
        size: 100,
      });
      setAllProducts(response.content);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar produtos"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter products on the frontend
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allProducts, selectedCategory, searchQuery]);

  const handleSearch = () => {
    updateURLParams(searchQuery, selectedCategory);
  };

  const handleCategoryClick = (category: ProductCategory | null) => {
    updateURLParams(searchQuery, category);
  };

  const updateURLParams = (
    search: string,
    category: ProductCategory | null
  ) => {
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (category) {
      params.set("category", category);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSearchParams(new URLSearchParams());
  };

  const handleProductClick = (productId: number) => {
    navigate(`/produto/${productId}`);
  };

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-20">
          {/* Header with Search */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Explorar</h1>
            <p className="text-gray-600 text-lg mb-6">
              Encontre o equipamento perfeito para seu escritório
            </p>

            <div className="flex gap-3 items-center bg-white p-3 rounded-lg ">
              <div className="flex-1 relative">
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  className="w-full h-12 pl-12 pr-12 border-0 bg-gray-50 rounded-md text-base focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      updateURLParams("", selectedCategory);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md "
              >
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Buscar
              </Button>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCategory) && (
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 font-medium">
                  Filtros ativos:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md text-sm font-medium text-primary ">
                    Busca: "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        updateURLParams("", selectedCategory);
                      }}
                      className="hover:text-primary/70 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-md text-sm font-medium text-success ">
                    {PRODUCT_CATEGORIES[selectedCategory]}
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        updateURLParams(searchQuery, null);
                      }}
                      className="hover:text-success/70 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Limpar todos
                </button>
              </div>
            )}
          </div>

          {/* Main Content: Categories + Products */}
          <div className="flex gap-6">
            {/* Categories Sidebar */}
            <aside className="w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-3">
                <div className="bg-gradient-to-br from-primary to-primary/90 text-white p-5 rounded-lg ">
                  <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <FontAwesomeIcon icon={faList} />
                    Categorias
                  </h2>
                  <p className="text-xs opacity-90">Navegue por categoria</p>
                </div>

                <div className="bg-white p-3 rounded-lg  space-y-2">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-all text-sm ${
                      selectedCategory === null
                        ? "bg-primary text-white "
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Todas as Categorias
                  </button>
                  {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        handleCategoryClick(key as ProductCategory)
                      }
                      className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-all text-sm ${
                        selectedCategory === key
                          ? "bg-success text-white "
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-gray-600 text-lg">
                    Carregando produtos...
                  </p>
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCategory
                          ? PRODUCT_CATEGORIES[selectedCategory]
                          : "Todos os Produtos"}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {filteredProducts.length}{" "}
                        {filteredProducts.length === 1
                          ? "produto encontrado"
                          : "produtos encontrados"}
                      </p>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-md bg-gray-100 mb-6">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-gray-400 text-3xl"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Nenhum produto encontrado
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Não encontramos produtos que correspondam à sua busca.
                        Tente ajustar os filtros ou fazer uma nova pesquisa.
                      </p>
                      <Button
                        onClick={handleClearFilters}
                        className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 py-3 rounded-md "
                      >
                        Limpar todos os filtros
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden transition-all cursor-pointer border-0 bg-white rounded-lg  hover: group"
                          onClick={() => handleProductClick(product.id)}
                        >
                          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                            {product.productImage ? (
                              <img
                                src={`data:image/jpeg;base64,${product.productImage}`}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="text-gray-300 text-center p-8">
                                <FontAwesomeIcon
                                  icon={faSearch}
                                  className="text-6xl mb-4"
                                />
                                <p className="text-sm">Sem imagem</p>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-5 bg-white">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                              {product.description ||
                                "Sem descrição disponível"}
                            </p>
                            <div className="flex items-center justify-between pt-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Preço
                                </p>
                                <span className="text-2xl font-bold text-primary">
                                  R${" "}
                                  {product.price.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              {product.rating && (
                                <div className="flex items-center gap-1 bg-success/10 px-3 py-2 rounded-md ">
                                  <span className="text-success text-lg">
                                    ★
                                  </span>
                                  <span className="text-sm font-bold text-success">
                                    {product.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
