export interface CategoriaComercio {
  id: number;
  nombre: string;
  icono?: string;
  descripcion?: string;
  activo: boolean;
}

export interface Comercio {
  id: number;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  correo?: string;
  logo?: string;
  banner?: string;
  nit?: string;
  activo: boolean;
  categoria?: string;
  categoriaId?: number;
  metodosPago?: string;
  horaApertura?: string;
  horaCierre?: string;
  diasAtencion?: string;
  tiempoPreparacionMin?: number;
  pausaManual?: boolean;
  abierto?: boolean;
  estadoHorario?: string;
}

export interface ComercioRequest {
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  correo?: string;
  logo?: string;
  banner?: string;
  nit?: string;
  activo?: boolean;
  metodosPago?: string;
  horaApertura?: string;
  horaCierre?: string;
  diasAtencion?: string;
  tiempoPreparacionMin?: number;
  pausaManual?: boolean;
}

export interface Sucursal {
  id: number;
  comercioId: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  telefono?: string;
  latitud?: number;
  longitud?: number;
  radioEntregaKm?: number;
  abierta: boolean;
  creadoEn?: string;
}

export interface SucursalRequest {
  comercioId: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  abierta?: boolean;
}
