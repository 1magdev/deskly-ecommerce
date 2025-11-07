import { apiClient } from "@/lib/api-client";
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  PageResponse,
  PageRequest,
} from "@/types/api.types";

class ProductService {
  async getCatalog(params?: PageRequest): Promise<PageResponse<Product>> {
    const queryParams: Record<string, string> = {
      page: (params?.page ?? 0).toString(),
      size: (params?.size ?? 10).toString(),
    };

    if (params?.search) queryParams.search = params.search;

    return apiClient.get<PageResponse<Product>>("/catalog/products", queryParams);
  }

  async getCatalogProduct(id: string): Promise<Product> {
    return apiClient.get(`/catalog/products/${id}`);
  }

  async getProducts(params?: PageRequest): Promise<PageResponse<Product>> {
    const queryParams: Record<string, string> = {
      page: (params?.page ?? 0).toString(),
      size: (params?.size ?? 10).toString(),
    };

    if (params?.search) queryParams.search = params.search;

    return apiClient.get<PageResponse<Product>>("/products", queryParams);
  }

  async getProductById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  }

  async createProduct(data: ProductCreateRequest): Promise<void> {
    return apiClient.post<void>("/products", data);
  }

  async updateProduct(id: number, data: ProductUpdateRequest): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, data);
  }

  async toggleProductStatus(id: number, active: boolean): Promise<void> {
    return apiClient.patch<void>(`/products/${id}/status?active=${active}`);
  }

  async deleteProduct(id: number): Promise<void> {
    return apiClient.delete<void>(`/products/${id}`);
  }
}

export const productService = new ProductService();
