import { apiClient } from '../api/apiClient';
import { WompiAcceptanceResponse, WompiBank, WompiPaymentRequest } from '../types';

export const wompiService = {
  async getAcceptanceTokens(): Promise<WompiAcceptanceResponse> {
    const response = await apiClient.get<WompiAcceptanceResponse>('/api/pagos/wompi/acceptance');
    return response.data;
  },

  async getPseBanks(): Promise<WompiBank[]> {
    const response = await apiClient.get<WompiBank[]>('/api/pagos/wompi/pse/banks');
    return response.data;
  },

  async createTransaction(data: WompiPaymentRequest): Promise<Record<string, unknown>> {
    const response = await apiClient.post<Record<string, unknown>>('/api/pagos/wompi/transactions', data);
    return response.data;
  },

  async getTransaction(transactionId: string): Promise<Record<string, unknown>> {
    const response = await apiClient.get<Record<string, unknown>>(`/api/pagos/wompi/transactions/${transactionId}`);
    return response.data;
  },
};
