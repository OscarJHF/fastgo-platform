export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
}

export interface Producto {
  id: number;
  comercioId?: number;
  sucursalId: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempoPreparacion?: number;
  imagenPrincipal?: string;
  disponible: boolean;
  stock?: number;
  destacado?: boolean;
  categoriaNombre?: string;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface ProductoRequest {
  comercioId?: number;
  sucursalId: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempoPreparacion?: number;
  imagenPrincipal?: string;
  disponible?: boolean;
  stock?: number;
  destacado?: boolean;
}
