import { apiClient, TOKEN_STORAGE_KEY } from '../api/apiClient';
import { AuthUser, LoginRequest, LoginResponse, RegisterRequest, DatosUsuarioReutilizables } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthUser> {
    const response = await apiClient.post<AuthUser>('/api/usuarios', data);
    return response.data;
  },

  async getMe(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/api/usuarios/me');
    return response.data;
  },

  async cambiarRol(nuevoRol: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/cambiar-rol', { nuevoRol });
    if (response.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    return response.data;
  },

  async getDatosReutilizables(correo: string): Promise<DatosUsuarioReutilizables> {
    const response = await apiClient.get<DatosUsuarioReutilizables>(
      `/api/usuarios/datos-reutilizables?correo=${encodeURIComponent(correo)}`
    );
    return response.data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('fastgo:auth:unauthorized'));
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
};
