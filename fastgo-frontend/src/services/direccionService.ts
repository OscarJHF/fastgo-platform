import { apiClient } from '../api/apiClient';
import { Direccion, DireccionRequest } from '../types';

export const direccionService = {
  async listMyAddresses(): Promise<Direccion[]> {
    const response = await apiClient.get<Direccion[]>('/api/direcciones');
    return response.data;
  },

  async getAddress(id: number): Promise<Direccion> {
    const response = await apiClient.get<Direccion>(`/api/direcciones/${id}`);
    return response.data;
  },

  async createAddress(data: DireccionRequest): Promise<Direccion> {
    const response = await apiClient.post<Direccion>('/api/direcciones', data);
    return response.data;
  },

  async updateAddress(id: number, data: DireccionRequest): Promise<Direccion> {
    const response = await apiClient.put<Direccion>(`/api/direcciones/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await apiClient.delete(`/api/direcciones/${id}`);
  },

  async setPrincipal(id: number): Promise<Direccion> {
    const response = await apiClient.put<Direccion>(`/api/direcciones/${id}/principal`);
    return response.data;
  },
};
