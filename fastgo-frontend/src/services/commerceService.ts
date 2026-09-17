import { apiClient } from '../api/apiClient';
import { Comercio, ComercioRequest } from '../types';

export const commerceService = {
  async listCommerces(): Promise<Comercio[]> {
    const response = await apiClient.get<Comercio[]>('/api/comercios');
    return response.data;
  },

  async getCommerce(id: number): Promise<Comercio> {
    const response = await apiClient.get<Comercio>(`/api/comercios/${id}`);
    return response.data;
  },

  async createCommerce(data: ComercioRequest): Promise<Comercio> {
    const response = await apiClient.post<Comercio>('/api/comercios', data);
    return response.data;
  },

  async updateCommerce(id: number, data: ComercioRequest): Promise<Comercio> {
    const response = await apiClient.put<Comercio>(`/api/comercios/${id}`, data);
    return response.data;
  },

  async deleteCommerce(id: number): Promise<void> {
    await apiClient.delete(`/api/comercios/${id}`);
  },

  async getPropio(): Promise<Comercio> {
    const response = await apiClient.get<Comercio>('/api/comercios/propio');
    return response.data;
  },

  async togglePausaManual(id: number, pausaManual: boolean): Promise<Comercio> {
    const response = await apiClient.patch<Comercio>(`/api/comercios/${id}/pausa-manual?pausaManual=${pausaManual}`);
    return response.data;
  },
};
