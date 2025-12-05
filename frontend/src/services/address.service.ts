import { apiClient } from "@/lib/api-client";
import type { Address, AddressCreateRequest } from "@/types/api.types";

class AddressService {
  async getMyAddresses(): Promise<Address[]> {
    return apiClient.get<Address[]>("/addresses");
  }

  async createAddress(data: AddressCreateRequest): Promise<Address> {
    return apiClient.post<Address>("/addresses", data);
  }

  async updateAddress(
    id: number,
    data: Partial<AddressCreateRequest>
  ): Promise<Address> {
    return apiClient.put<Address>(`/addresses/${id}`, data);
  }

  async deleteAddress(id: number): Promise<void> {
    return apiClient.delete<void>(`/addresses/${id}`);
  }
}

export const addressService = new AddressService();
