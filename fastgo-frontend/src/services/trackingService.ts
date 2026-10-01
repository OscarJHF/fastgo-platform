import { apiClient } from '../api/apiClient';
import { TrackingUbicacionRequest, TrackingResponse } from '../types';

export const trackingService = {
  async enviarUbicacion(request: TrackingUbicacionRequest): Promise<TrackingResponse> {
    const response = await apiClient.post<TrackingResponse>('/api/tracking/ubicacion', request);
    return response.data;
  },

  async obtenerUltimaUbicacion(pedidoId: number): Promise<TrackingResponse | null> {
    try {
      const response = await apiClient.get<TrackingResponse>(`/api/tracking/pedido/${pedidoId}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
