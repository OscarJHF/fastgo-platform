export type Role = 'CLIENTE' | 'COMERCIO' | 'DOMICILIARIO' | 'ADMIN';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  mensaje: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  password: string;
  foto?: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  foto?: string;
  estado: boolean;
  rol: Role;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
