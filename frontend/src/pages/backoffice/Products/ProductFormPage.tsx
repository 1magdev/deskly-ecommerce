import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { productService } from "@/services/product.service";
import type { Product, ProductCreateRequest } from "@/types/api.types";
import { toast } from "sonner";

interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  description?: string;
  rating?: string;
  images?: string;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  rating?: number;
  quantity?: number;
  images: File[];
  imageBase64?: string;
  imagePreview?: string;
}

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: 0,
    rating: 0,
    quantity: 0,
    images: [],
    imageBase64: undefined,
    imagePreview: undefined,
  });
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
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        rating: product.rating,
        quantity: product.quantity,
        images: [], // Não carregamos imagens existentes por enquanto
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

    if (formData.quantity < 0) {
      newErrors.quantity = "Quantidade não pode ser negativa";
    }

    if (
      formData.rating !== undefined &&
      (formData.rating < 0 || formData.rating > 5)
    ) {
      newErrors.rating = "Avaliação deve estar entre 0 e 5";
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
      if (isEditing && id) {
        const updateData: ProductCreateRequest & { imageBase64?: string } = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          rating: formData.rating,
          quantity: formData.quantity,
          imageBase64: formData.imageBase64,
        };

        await productService.updateProductWithBase64(parseInt(id), updateData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        const createData: ProductCreateRequest & { imageBase64?: string } = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          rating: formData.rating,
          quantity: formData.quantity,
          imageBase64: formData.imageBase64,
        };

        await productService.createProductWithBase64(createData);
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

  const handleChange = (
    field: keyof FormData,
    value: string | number | File[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao editar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho do arquivo (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        imageBase64: base64String,
        imagePreview: base64String,
      }));
    };
    reader.readAsDataURL(file);
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
              {/* Coluna Esquerda */}
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

              {/* Coluna Direita */}
              <div className="space-y-6">
                {/* Upload de Imagem */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300">
                  <label className="flex items-center gap-2 text-sm font-semibold text-dark mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Imagem do Produto
                  </label>

                  {!formData.imagePreview ? (
                    <div className="text-center py-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mx-auto h-16 w-16 text-primary/40 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg
                            hover:bg-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Escolher Imagem
                        </label>
                      </div>
                      <p className="mt-4 text-xs text-gray-600 flex items-center justify-center gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Máx: 5MB • JPG, PNG, GIF
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
                        <div className="relative w-full h-72 bg-white rounded-xl overflow-hidden shadow-xl border-2 border-primary/20">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain p-4"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              imageBase64: undefined,
                              imagePreview: undefined,
                            }))
                          }
                          className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-2.5
                            hover:from-red-600 hover:to-red-700 hover:scale-110 transition-all duration-200 shadow-lg
                            focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 z-10"
                          title="Remover imagem"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-success/10 text-success px-4 py-2.5 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-semibold">Imagem carregada com sucesso!</span>
                      </div>
                    </div>
                  )}

                  {errors.images && (
                    <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm font-medium">{errors.images}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/backoffice/products")}
                disabled={loading}
                className="border-success text-success hover:bg-success/10"
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
