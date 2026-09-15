import axios from 'axios';
import { ApiError } from '../types';

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data;
    if (typeof data === 'object' && data !== null) {
      return {
        timestamp: data.timestamp,
        status: error.response.status,
        error: data.error || 'ERROR',
        message: data.message || 'Ocurrió un error en la solicitud',
        fields: data.fields,
      };
    }
    return {
      status: error.response.status,
      error: 'HTTP_ERROR',
      message: typeof data === 'string' ? data : 'Error de respuesta del servidor',
    };
  }

  if (axios.isAxiosError(error) && error.request) {
    return {
      status: 0,
      error: 'NETWORK_ERROR',
      message: 'No se pudo establecer conexión con el servidor FastGo. Verifica que esté en ejecución.',
    };
  }

  return {
    status: 500,
    error: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Error inesperado en la aplicación',
  };
}
