import { Producto } from './product';

export interface Carrito {
  id: number;
  usuarioId: number;
  sucursalId: number;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface CarritoDetalle {
  id: number;
  carritoId: number;
  productoId: number;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface CartItemWithProduct extends CarritoDetalle {
  producto?: Producto;
}

export interface AgregarCarritoRequest {
  carritoId: number;
  productoId: number;
  cantidad: number;
}
