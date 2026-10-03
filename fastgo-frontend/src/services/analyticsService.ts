import { apiClient } from '../api/apiClient';
import { AnalyticsEventPayload, AnalyticsMetricsResponse } from '../types';

export const analyticsService = {
  async track(event: AnalyticsEventPayload): Promise<{ status: string }> {
    try {
      const response = await apiClient.post<{ status: string }>('/api/analytics/track', event);
      return response.data;
    } catch (err) {
      console.warn('Error reporting analytics event:', err);
      return { status: 'error' };
    }
  },

  async getMetrics(periodo: string = '7_DIAS'): Promise<AnalyticsMetricsResponse> {
    const response = await apiClient.get<AnalyticsMetricsResponse>('/api/analytics/metricas', {
      params: { periodo },
    });
    return response.data;
  },

  async exportCsv(periodo: string = '30_DIAS'): Promise<Blob> {
    const response = await apiClient.get('/api/analytics/exportar', {
      params: { periodo },
      responseType: 'blob',
    });
    return response.data;
  },
};
