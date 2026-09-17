import { apiClient } from '../api/apiClient';
import { DetallePedido, OrderStatus, Pedido } from '../types';

export const pedidoService = {
  async createOrder(params: {
    carritoId: number;
    direccionId: number;
    costoEnvio?: number;
    observaciones?: string;
    metodoPago?: string;
  }): Promise<Pedido> {
    const response = await apiClient.post<Pedido>('/api/pedidos', null, {
      params: {
        carritoId: params.carritoId,
        direccionId: params.direccionId,
        costoEnvio: params.costoEnvio,
        observaciones: params.observaciones,
        metodoPago: params.metodoPago,
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
};
