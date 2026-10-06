import { apiClient } from '../api/apiClient';
import { DetallePedido, OrderStatus, Pedido } from '../types';

export const pedidoService = {
  async createOrder(params: {
    carritoId: number;
    direccionId: number;
    costoEnvio?: number;
    observaciones?: string;
    metodoPago?: string;
    comprobantePagoUrl?: string;
    comprobante?: File | Blob;
  }): Promise<Pedido> {
    if (params.comprobante) {
      const formData = new FormData();
      formData.append('comprobante', params.comprobante);
      const queryParams: Record<string, any> = {
        carritoId: params.carritoId,
        direccionId: params.direccionId,
      };
      if (params.costoEnvio !== undefined) queryParams.costoEnvio = params.costoEnvio;
      if (params.observaciones) queryParams.observaciones = params.observaciones;
      if (params.metodoPago) queryParams.metodoPago = params.metodoPago;
      if (params.comprobantePagoUrl) queryParams.comprobantePagoUrl = params.comprobantePagoUrl;

      const response = await apiClient.post<Pedido>('/api/pedidos', formData, {
        params: queryParams,
      });
      return response.data;
    }

    const response = await apiClient.post<Pedido>('/api/pedidos', null, {
      params: {
        carritoId: params.carritoId,
        direccionId: params.direccionId,
        costoEnvio: params.costoEnvio,
        observaciones: params.observaciones,
        metodoPago: params.metodoPago,
        comprobantePagoUrl: params.comprobantePagoUrl,
      },
    });
    return response.data;
  },

  async rechazarOrder(id: number, motivo?: string): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/rechazar`, null, {
      params: { motivo },
    });
    return response.data;
  },

  async getOrder(id: number): Promise<Pedido> {
    const response = await apiClient.get<Pedido>(`/api/pedidos/${id}`);
    return response.data;
  },

  async getMyOrders(): Promise<Pedido[]> {
    const response = await apiClient.get<Pedido[]>('/api/pedidos/usuario');
    return response.data;
  },

  async getOrderDetails(orderId: number): Promise<DetallePedido[]> {
    const response = await apiClient.get<DetallePedido[]>(`/api/pedidos/${orderId}/detalles`);
    return response.data;
  },

  async cancelOrder(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/cancelar`);
    return response.data;
  },

  // COMERCIO
  async listBySucursal(sucursalId: number): Promise<Pedido[]> {
    const response = await apiClient.get<Pedido[]>(`/api/pedidos/sucursal/${sucursalId}`);
    return response.data;
  },

  async listByStatus(status: OrderStatus): Promise<Pedido[]> {
    const response = await apiClient.get<Pedido[]>(`/api/pedidos/estado/${status}`);
    return response.data;
  },

  async confirmOrder(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/confirmar`);
    return response.data;
  },

  async prepareOrder(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/preparar`);
    return response.data;
  },

  async markReady(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/listo`);
    return response.data;
  },

  async aprobarPago(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/aprobar-pago`);
    return response.data;
  },

  async rechazarPago(id: number, motivo?: string): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/rechazar-pago`, null, {
      params: { motivo },
    });
    return response.data;
  },

  // DOMICILIARIO
  async listAvailableForDelivery(): Promise<Pedido[]> {
    const response = await apiClient.get<Pedido[]>('/api/pedidos/domiciliario/disponibles');
    return response.data;
  },

  async listMyDeliveries(): Promise<Pedido[]> {
    const response = await apiClient.get<Pedido[]>('/api/pedidos/domiciliario/mios');
    return response.data;
  },

  async claimOrder(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/tomar`);
    return response.data;
  },

  async markInTransit(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/en-camino`);
    return response.data;
  },

  async markDelivered(id: number): Promise<Pedido> {
    const response = await apiClient.put<Pedido>(`/api/pedidos/${id}/entregar`);
    return response.data;
  },

  async subirComprobante(id: number, file: File | Blob): Promise<{ url: string; filename: string; mensaje: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ url: string; filename: string; mensaje: string }>(
      `/api/pedidos/${id}/comprobante`,
      formData
    );
    return response.data;
  },

  async getComprobanteBlob(idOrUrl: number | string): Promise<{ blobUrl: string; isPdf: boolean }> {
    const endpoint = typeof idOrUrl === 'number' ? `/api/pedidos/${idOrUrl}/comprobante` : idOrUrl;
    const response = await apiClient.get(endpoint, {
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const contentType = (response.headers['content-type'] as string) || blob.type || '';
    const isPdf = contentType.toLowerCase().includes('pdf') || (typeof idOrUrl === 'string' && idOrUrl.toLowerCase().endsWith('.pdf'));
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl, isPdf };
  },
};
