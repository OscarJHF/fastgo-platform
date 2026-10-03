import { apiClient } from '../api/apiClient';
import { AdminTienda, ConfiguracionSuscripcion, AuditoriaAdmin, AdminUsuario } from '../types';

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

  async deleteStore(id: number, motivo?: string): Promise<{ mensaje: string; id: number }> {
    const response = await apiClient.delete<{ mensaje: string; id: number }>(`/api/admin/tiendas/${id}`, {
      data: { motivo },
    });
    return response.data;
  },

  async listUsers(query?: string, rol?: string, estado?: boolean): Promise<AdminUsuario[]> {
    const params: Record<string, any> = {};
    if (query) params.query = query;
    if (rol) params.rol = rol;
    if (estado !== undefined) params.estado = estado;
    const response = await apiClient.get<AdminUsuario[]>('/api/admin/usuarios', { params });
    return response.data;
  },

  async updateUser(id: number, data: { nombre?: string; apellido?: string; telefono?: string; correo?: string }): Promise<AdminUsuario> {
    const response = await apiClient.put<AdminUsuario>(`/api/admin/usuarios/${id}`, data);
    return response.data;
  },

  async changeUserStatus(id: number, estado: boolean, motivo?: string): Promise<AdminUsuario> {
    const response = await apiClient.put<AdminUsuario>(`/api/admin/usuarios/${id}/estado`, { estado, motivo });
    return response.data;
  },

  async changeUserRoles(id: number, roles: string[]): Promise<AdminUsuario> {
    const response = await apiClient.put<AdminUsuario>(`/api/admin/usuarios/${id}/roles`, { roles });
    return response.data;
  },

  async resetUserPassword(id: number): Promise<{ temporalPassword: string; mensaje: string }> {
    const response = await apiClient.post<{ temporalPassword: string; mensaje: string }>(`/api/admin/usuarios/${id}/reset-password`);
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

