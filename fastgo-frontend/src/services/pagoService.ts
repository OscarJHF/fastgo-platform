import { apiClient } from '../api/apiClient';
import { Pago } from '../types';

export const pagoService = {
  async getPaymentsByOrder(pedidoId: number): Promise<Pago[]> {
    const response = await apiClient.get<Pago[]>(`/api/pagos/pedido/${pedidoId}`);
    return response.data;
  },

  async getPayment(id: number): Promise<Pago> {
    const response = await apiClient.get<Pago>(`/api/pagos/${id}`);
    return response.data;
  },

  async updatePaymentStatus(id: number, estado: string): Promise<Pago> {
    const response = await apiClient.put<Pago>(`/api/pagos/${id}/estado`, null, {
      params: { estado },
    });
    return response.data;
  },
};
