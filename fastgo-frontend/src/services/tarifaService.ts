import { apiClient } from '../api/apiClient';
import { CalcularTarifaRequest, TarifaResponse } from '../types';

export const tarifaService = {
  async calcular(req?: CalcularTarifaRequest): Promise<TarifaResponse> {
    const response = await apiClient.post<TarifaResponse>('/api/domicilios/calcular-tarifa', req || {});
    return response.data;
  },
};
