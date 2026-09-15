import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Storage token key
export const TOKEN_STORAGE_KEY = 'fastgo_auth_token';

// Interceptor para inyectar Bearer Token si existe
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejo centralizado de 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Si la ruta no es /api/auth/login, limpiar credenciales y redirigir
      const isLoginRequest = error.config?.url?.includes('/api/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Notificar evento global de logout para sincronizar estado
        window.dispatchEvent(new CustomEvent('fastgo:auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
