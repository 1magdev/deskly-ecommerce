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
} from "@/types/api.types";
import { toast } from "sonner";
import { Upload, Trash2, CheckCircle, ImageIcon, Info } from "lucide-react";

interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  description?: string;
  rating?: string;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  rating?: number;
  quantity?: number;
  imageBase64?: string;
  imagePreview?: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  description: "",
  price: 0,
  rating: 0,
  quantity: 0,
  imageBase64: undefined,
  imagePreview: undefined,
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
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        rating: product.rating,
        quantity: product.quantity,
        imageBase64: product.productImage,
        imagePreview: product.productImage
          ? `${
              !product.productImage.includes("data:image/")
                ? "data:image/png;base64"
                : ""
            }${product.productImage}`
          : undefined,
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
        const updateData: ProductUpdateRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          rating: formData.rating,
          quantity: formData.quantity,
          image: formData.imageBase64,
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
          image: formData.imageBase64,
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
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

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

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageBase64: undefined,
      imagePreview: undefined,
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
                    Imagem do Produto
                  </label>

                  {!formData.imagePreview ? (
                    <div className="text-center py-8">
                      <Upload className="mx-auto h-16 w-16 text-primary/40 mb-4" />
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
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                          <Upload className="h-5 w-5" />
                          Escolher Imagem
                        </label>
                      </div>
                      <p className="mt-4 text-xs text-gray-600 flex items-center justify-center gap-1.5">
                        <Info className="h-4 w-4 text-gray-400" />
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
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-2.5 hover:from-red-600 hover:to-red-700 hover:scale-110 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 z-10"
                          title="Remover imagem"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-2 bg-success/10 text-success px-4 py-2.5 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-semibold">
                          Imagem carregada com sucesso!
                        </span>
                      </div>
                    </div>
                  )}
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
