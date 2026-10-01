import { apiClient } from '../api/apiClient';
import { AdminTienda, ConfiguracionSuscripcion, AuditoriaAdmin } from '../types';

export const adminService = {
  async listStores(): Promise<AdminTienda[]> {
    const response = await apiClient.get<AdminTienda[]>('/api/admin/tiendas');
    return response.data;
  },

  async activateStore(id: number, razon?: string): Promise<AdminTienda> {
    const response = await apiClient.put<AdminTienda>(`/api/admin/tiendas/${id}/activar`, { razon });
    return response.data;
  },

  async deactivateStore(id: number, razon?: string): Promise<AdminTienda> {
    const response = await apiClient.put<AdminTienda>(`/api/admin/tiendas/${id}/desactivar`, { razon });
    return response.data;
  },

  async suspendStore(id: number, razon?: string): Promise<AdminTienda> {
    const response = await apiClient.put<AdminTienda>(`/api/admin/tiendas/${id}/suspender`, { razon });
    return response.data;
  },

  async reactivateStore(id: number, razon?: string): Promise<AdminTienda> {
    const response = await apiClient.put<AdminTienda>(`/api/admin/tiendas/${id}/reactivar`, { razon });
    return response.data;
  },

  async getSubscriptionConfig(): Promise<ConfiguracionSuscripcion> {
    const response = await apiClient.get<ConfiguracionSuscripcion>('/api/admin/suscripciones/configuracion');
    return response.data;
  },

  async updateSubscriptionConfig(data: Partial<ConfiguracionSuscripcion>): Promise<ConfiguracionSuscripcion> {
    const response = await apiClient.put<ConfiguracionSuscripcion>('/api/admin/suscripciones/configuracion', data);
    return response.data;
  },

  async listAuditLogs(): Promise<AuditoriaAdmin[]> {
    const response = await apiClient.get<AuditoriaAdmin[]>('/api/admin/auditoria');
    return response.data;
  },
};
