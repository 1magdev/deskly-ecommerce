import { apiClient } from "@/lib/api-client";
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  PageResponse,
  PageRequest,
} from "@/types/api.types";

class ProductService {
  /**
   * Lista produtos com paginação e busca
   */
  async getProducts(params?: PageRequest): Promise<PageResponse<Product>> {
    const queryParams: Record<string, string> = {
      page: (params?.page ?? 0).toString(),
      size: (params?.size ?? 10).toString(),
    };

    if (params?.search) {
      queryParams.search = params.search;
    }

    return apiClient.get<PageResponse<Product>>("/products", queryParams);
  }

  /**
   * Busca produto por ID
   */
  async getProductById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  }

  /**
   * Cria um novo produto
   */
  async createProduct(data: ProductCreateRequest): Promise<void> {
    return apiClient.post<void>("/products", data);
  }

  /**
   * Cria um novo produto com imagem em base64
   */
  async createProductWithBase64(
    data: ProductCreateRequest & { imageBase64?: string }
  ): Promise<void> {
    return apiClient.post<void>("/products", data);
  }

  /**
   * Cria produto com imagens
   */
  async createProductWithImages(
    data: ProductCreateRequest,
    images: File[]
  ): Promise<void> {
    const formData = new FormData();

    // Adiciona os dados do produto como JSON
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("data", blob);

    // Adiciona as imagens
    images.forEach((image) => {
      formData.append("images", image);
    });

    return apiClient.postFormData<void>("/products", formData);
  }

  /**
   * Atualiza um produto
   */
  async updateProduct(
    id: number,
    data: ProductUpdateRequest
  ): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, data);
  }

  /**
   * Atualiza um produto com imagem em base64
   */
  async updateProductWithBase64(
    id: number,
    data: ProductUpdateRequest & { imageBase64?: string }
  ): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, data);
  }

  /**
   * Atualiza produto com imagem
   */
  async updateProductWithImage(
    id: number,
    data: ProductUpdateRequest,
    image?: File
  ): Promise<Product> {
    const formData = new FormData();

    // Adiciona os dados do produto como JSON
    const blob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });
    formData.append("data", blob);

    // Adiciona a imagem se fornecida
    if (image) {
      formData.append("image", image);
    }

    return apiClient.putFormData<Product>(
      `/products/${id}/with-image`,
      formData
    );
  }

  /**
   * Ativa ou desativa um produto
   */
  async toggleProductStatus(id: number, active: boolean): Promise<void> {
    return apiClient.patch<void>(`/products/${id}/status?active=${active}`);
  }

  /**
   * Ativa um produto
   */
  async activateProduct(id: number): Promise<void> {
    return this.toggleProductStatus(id, true);
  }

  /**
   * Desativa um produto
   */
  async deactivateProduct(id: number): Promise<void> {
    return this.toggleProductStatus(id, false);
  }
}

export const productService = new ProductService();
