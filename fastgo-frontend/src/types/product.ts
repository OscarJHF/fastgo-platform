export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  sucursalId: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempoPreparacion?: number;
  imagenPrincipal?: string;
  disponible: boolean;
  destacado?: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ProductoRequest {
  sucursalId: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempoPreparacion?: number;
  imagenPrincipal?: string;
  disponible?: boolean;
  destacado?: boolean;
}
