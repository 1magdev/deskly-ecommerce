import { apiClient } from "@/lib/api-client";
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  PageResponse,
  PageRequest,
} from "@/types/api.types";

class ProductService {
  async getCatalog(/* params: {
    category?: string;
    query?: string;
  } */): Promise<PageResponse<Product>> {
    return apiClient.get<PageResponse<Product>>("/catalog/products");
  }

  async getCatalogProduct(params: { id: string }): Promise<Product> {
    return apiClient.get(`/catalog/products/${params.id}`);
  }

  /**
   * Lista produtos com paginação e busca (backoffice)
   */
  async getProducts(params?: PageRequest): Promise<PageResponse<Product>> {
    const queryParams: Record<string, string> = {
      page: (params?.page ?? 0).toString(),
      size: (params?.size ?? 10).toString(),
    };

    if (params?.search) {
      queryParams.search = params.search;
    }
    const products = apiClient.get<PageResponse<Product>>(
      "/admin/products",
      queryParams
    );
    console.log(products);
    return products;
  }

  /**
   * Busca produto por ID (backoffice)
   */
  async getProductById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/admin/products/${id}`);
  }

  /**
   * Cria um novo produto (backoffice)
   */
  async createProduct(data: ProductCreateRequest): Promise<void> {
    return apiClient.post<void>("/admin/products", data);
  }

  /**
   * Cria um novo produto com imagem em base64 (backoffice)
   */
  async createProductWithBase64(
    data: ProductCreateRequest & { imageBase64?: string }
  ): Promise<void> {
    return apiClient.post<void>("/admin/products", data);
  }

  /**
   * Cria produto com imagens (backoffice)
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

    return apiClient.postFormData<void>("/admin/products", formData);
  }

  /**
   * Atualiza um produto (backoffice)
   */
  async updateProduct(
    id: number,
    data: ProductUpdateRequest
  ): Promise<Product> {
    return apiClient.put<Product>(`/admin/products/${id}`, data);
  }

  /**
   * Atualiza um produto com imagem em base64 (backoffice)
   */
  async updateProductWithBase64(
    id: number,
    data: ProductUpdateRequest & { imageBase64?: string }
  ): Promise<Product> {
    return apiClient.put<Product>(`/admin/products/${id}`, data);
  }

  /**
   * Atualiza produto com imagem (backoffice)
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
      `/admin/products/${id}/with-image`,
      formData
    );
  }

  /**
   * Ativa ou desativa um produto (backoffice)
   */
  async toggleProductStatus(id: number, active: boolean): Promise<void> {
    return apiClient.patch<void>(`/admin/products/${id}/status?active=${active}`);
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
