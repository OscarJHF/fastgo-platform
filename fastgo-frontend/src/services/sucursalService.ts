import { apiClient } from '../api/apiClient';
import { Sucursal, SucursalRequest } from '../types';

export const sucursalService = {
  async listByCommerce(comercioId: number): Promise<Sucursal[]> {
    const response = await apiClient.get<Sucursal[]>(`/api/sucursales/comercio/${comercioId}`);
    return response.data;
  },

  async listOpen(): Promise<Sucursal[]> {
    const response = await apiClient.get<Sucursal[]>('/api/sucursales/abiertas');
    return response.data;
  },

  async getSucursal(id: number): Promise<Sucursal> {
    const response = await apiClient.get<Sucursal>(`/api/sucursales/${id}`);
    return response.data;
  },

  async createSucursal(data: SucursalRequest): Promise<Sucursal> {
    const response = await apiClient.post<Sucursal>('/api/sucursales', data);
    return response.data;
  },

  async updateSucursal(id: number, data: SucursalRequest): Promise<Sucursal> {
    const response = await apiClient.put<Sucursal>(`/api/sucursales/${id}`, data);
    return response.data;
  },

  async deleteSucursal(id: number): Promise<void> {
    await apiClient.delete(`/api/sucursales/${id}`);
  },
};
