import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import type {
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductCategory,
} from "@/types/api.types";
import { PRODUCT_CATEGORIES } from "@/types/api.types";
import { toast } from "sonner";
import { Upload, Trash2, CheckCircle, ImageIcon, Info, Star, X } from "lucide-react";

interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  description?: string;
  rating?: string;
  category?: string;
}

interface ImageData {
  base64: string;
  preview: string;
  isMain: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  rating?: number;
  quantity?: number;
  category?: ProductCategory;
  images: ImageData[];
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  description: "",
  price: 0,
  rating: 0,
  quantity: 0,
  category: undefined,
  images: [],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditing && id) {
      loadProduct(parseInt(id));
    }
  }, [id, isEditing]);

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true);
      const product = await productService.getProductById(productId);
      
      // Carregar imagens do produto
      const images: ImageData[] = [];
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, index) => {
          const base64 = img.includes("data:image/") ? img : `data:image/png;base64,${img}`;
          images.push({
            base64: img,
            preview: base64,
            isMain: index === 0, // Primeira imagem é principal por padrão
          });
        });
      } else if (product.productImage) {
        // Fallback para productImage antigo
        const base64 = product.productImage.includes("data:image/") 
          ? product.productImage 
          : `data:image/png;base64,${product.productImage}`;
        images.push({
          base64: product.productImage,
          preview: base64,
          isMain: true,
        });
      }
      
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        rating: product.rating,
        quantity: product.quantity,
        category: product.category,
        images,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar produto"
      );
      navigate("/backoffice/products");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (formData.price <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }

    if (formData.quantity !== undefined && formData.quantity < 0) {
      newErrors.quantity = "Quantidade não pode ser negativa";
    }

    if (
      formData.rating !== undefined &&
      (formData.rating < 0 || formData.rating > 5)
    ) {
      newErrors.rating = "Avaliação deve estar entre 0 e 5";
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    try {
      setLoading(true);

      // Extrair base64 das imagens (manter formato completo com data:image prefix)
      // O backend aceita o formato completo conforme documentação da API
      // Ordenar para colocar a imagem principal primeiro (backend marca primeira como principal)
      const sortedImages = [...formData.images].sort((a, b) => {
        if (a.isMain) return -1;
        if (b.isMain) return 1;
        return 0;
      });
      const imagesBase64 = sortedImages.map(img => img.base64);

      if (isEditing && id) {
        const updateData: ProductUpdateRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          rating: formData.rating,
          quantity: formData.quantity,
          category: formData.category,
          images: imagesBase64.length > 0 ? imagesBase64 : undefined,
        };
        await productService.updateProduct(parseInt(id), updateData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        const createData: ProductCreateRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          rating: formData.rating,
          quantity: formData.quantity,
          category: formData.category!,
          images: imagesBase64.length > 0 ? imagesBase64 : undefined,
        };
        await productService.createProduct(createData);
        toast.success("Produto cadastrado com sucesso!");
      }
      navigate("/backoffice/products");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar produto"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: A imagem deve ter no máximo 5MB`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: Por favor, selecione apenas arquivos de imagem`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const isFirstImage = formData.images.length === 0;
        
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              base64: base64String,
              preview: base64String,
              isMain: isFirstImage, // Primeira imagem é principal
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // Se removemos a imagem principal, tornar a primeira restante como principal
      if (prev.images[index].isMain && newImages.length > 0) {
        newImages[0].isMain = true;
      }
      return {
        ...prev,
        images: newImages,
      };
    });
  };

  const handleSetMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index,
      })),
    }));
  };

  if (loading && isEditing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando produto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <PageHeader title={isEditing ? "Alterar Produto" : "Cadastrar Produto"} />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormInput
                  label="Nome do Produto"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  error={errors.name}
                  required
                />

                <FormInput
                  label="Preço"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    handleChange("price", parseFloat(e.target.value))
                  }
                  error={errors.price}
                  required
                />

                <FormInput
                  label="Em estoque"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleChange("quantity", parseInt(e.target.value))
                  }
                  error={errors.quantity}
                  required
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category || ""}
                    onChange={(e) =>
                      handleChange("category", e.target.value as ProductCategory)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {Object.entries(PRODUCT_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>

                <FormTextarea
                  label="Descrição Detalhada"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  error={errors.description}
                  required
                />

                <FormInput
                  label="Avaliação"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    handleChange("rating", parseFloat(e.target.value))
                  }
                  error={errors.rating}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300">
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-3">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Imagens do Produto
                  </label>

                  <div className="space-y-4">
                    {/* Upload de imagens */}
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-primary/40 mb-2" />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="image-upload"
                          multiple
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                          Adicionar Imagens
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-600 flex items-center justify-center gap-1.5">
                        <Info className="h-3 w-3 text-gray-400" />
                        Máx: 5MB por imagem • JPG, PNG, GIF • Múltiplas imagens
                      </p>
                    </div>

                    {/* Lista de imagens */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {formData.images.map((image, index) => (
                          <div
                            key={index}
                            className={`relative group rounded-lg overflow-hidden border-2 ${
                              image.isMain
                                ? "border-primary ring-2 ring-primary"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="aspect-square bg-white">
                              <img
                                src={image.preview}
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                            
                            {/* Badge de imagem principal */}
                            {image.isMain && (
                              <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Principal
                              </div>
                            )}

                            {/* Botões de ação */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!image.isMain && (
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(index)}
                                  className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors"
                                  title="Definir como principal"
                                >
                                  <Star className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                                title="Remover imagem"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.images.length > 0 && (
                      <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2.5 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-semibold">
                          {formData.images.length} imagem(ns) carregada(s). A primeira será a principal.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/backoffice/products")}
                disabled={loading}
                className="border-success text-success hover:bg-success/10 hover:border-success hover:text-success"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? "Salvando..." : "Confirmar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
