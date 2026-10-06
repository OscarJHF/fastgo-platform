import { apiClient } from '../api/apiClient';
import { Comercio, ComercioRequest } from '../types';

export const commerceService = {
  async listCommerces(params?: { departamentoId?: number | string; municipioId?: number | string; categoriaId?: number }): Promise<Comercio[]> {
    const response = await apiClient.get<Comercio[]>('/api/comercios', { params });
    return response.data;
  },

  async listFeaturedCommerces(params?: { departamentoId?: number | string; municipioId?: number | string }): Promise<Comercio[]> {
    const response = await apiClient.get<Comercio[]>('/api/comercios/destacados', { params });
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

  async guardar(data: ComercioRequest): Promise<Comercio> {
    return this.createCommerce(data);
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

  async listMisTiendas(): Promise<Comercio[]> {
    const response = await apiClient.get<Comercio[]>('/api/comercios/mis-tiendas');
    return response.data;
  },

  async getSubscriptionConfig(): Promise<import('../types').ConfiguracionSuscripcion> {
    const response = await apiClient.get<import('../types').ConfiguracionSuscripcion>('/api/comercios/suscripciones/configuracion');
    return response.data;
  },

  async togglePausaManual(id: number, pausaManual: boolean): Promise<Comercio> {
    const response = await apiClient.patch<Comercio>(`/api/comercios/${id}/pausa-manual?pausaManual=${pausaManual}`);
    return response.data;
  },

  async getSuscripcion(comercioId: number): Promise<import('../types').SuscripcionResponse> {
    const response = await apiClient.get<import('../types').SuscripcionResponse>(`/api/comercios/${comercioId}/suscripcion`);
    return response.data;
  },

  async uploadSubscriptionProof(comercioId: number, file: File, referencia?: string): Promise<import('../types').SuscripcionResponse> {
    const formData = new FormData();
    formData.append('comprobante', file);
    if (referencia) {
      formData.append('referencia', referencia);
    }
    const response = await apiClient.post<import('../types').SuscripcionResponse>(
      `/api/comercios/${comercioId}/suscripcion/comprobante`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
