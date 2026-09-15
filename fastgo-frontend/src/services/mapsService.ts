import { apiClient } from '../api/apiClient';
import { MapGeocodeRequest, MapRouteRequest, MapsConfig } from '../types';

export const mapsService = {
  async getConfig(): Promise<MapsConfig> {
    const response = await apiClient.get<MapsConfig>('/api/maps/config');
    return response.data;
  },

  async geocode(request: MapGeocodeRequest): Promise<Record<string, unknown>> {
    const response = await apiClient.post<Record<string, unknown>>('/api/maps/geocode', request);
    return response.data;
  },

  async calculateRoute(request: MapRouteRequest): Promise<Record<string, unknown>> {
    const response = await apiClient.post<Record<string, unknown>>('/api/maps/route', request);
    return response.data;
  },
};
