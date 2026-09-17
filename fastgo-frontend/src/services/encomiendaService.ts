import { apiClient } from '../api/apiClient';
import { CrearEncomiendaRequest, Encomienda, EstadoEncomienda } from '../types';

export const encomiendaService = {
  async crear(data: CrearEncomiendaRequest): Promise<Encomienda> {
    const response = await apiClient.post<Encomienda>('/api/encomiendas', data);
    return response.data;
  },

  async misEncomiendas(): Promise<Encomienda[]> {
    const response = await apiClient.get<Encomienda[]>('/api/encomiendas/mis-encomiendas');
    return response.data;
  },

  async listarDisponibles(): Promise<Encomienda[]> {
    const response = await apiClient.get<Encomienda[]>('/api/encomiendas/disponibles');
    return response.data;
  },

  async listarAsignadas(): Promise<Encomienda[]> {
    const response = await apiClient.get<Encomienda[]>('/api/encomiendas/asignadas');
    return response.data;
  },

  async obtenerPorId(id: number): Promise<Encomienda> {
    const response = await apiClient.get<Encomienda>(`/api/encomiendas/${id}`);
    return response.data;
  },

  async tomarEncomienda(id: number): Promise<Encomienda> {
    const response = await apiClient.put<Encomienda>(`/api/encomiendas/${id}/tomar`);
    return response.data;
  },

  async actualizarEstado(
    id: number,
    estado: EstadoEncomienda,
    observaciones?: string
  ): Promise<Encomienda> {
    const response = await apiClient.put<Encomienda>(`/api/encomiendas/${id}/estado`, {
      estado,
      observaciones,
    });
    return response.data;
  },

  async cancelar(id: number): Promise<Encomienda> {
    const response = await apiClient.put<Encomienda>(`/api/encomiendas/${id}/cancelar`);
    return response.data;
  },
};
