export type OrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'PREPARANDO'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'LISTO_PARA_ENTREGA'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface Pedido {
  id: number;
  usuarioId: number;
  sucursalId: number;
  direccionId: number;
  domiciliarioId?: number | null;
  estado: OrderStatus;
  subtotal: number;
  costoEnvio: number;
  total: number;
  observaciones?: string;
  metodoPago?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  direccionTexto?: string;
  distanciaKm?: number;
  creadoEn: string;
  estadoPago?: 'PENDIENTE_VERIFICACION' | 'APROBADO' | 'RECHAZADO' | string;
  comprobantePagoUrl?: string;
  comercioNombre?: string;
  comercioDireccion?: string;
  sucursalNombre?: string;
  motivoRechazoPago?: string;
  gananciaDomiciliario?: number;
  destinoDireccion?: string;
  destinoCiudad?: string;
  destinoReferencia?: string;
  destinoLatitud?: number | null;
  destinoLongitud?: number | null;
  origenLatitud?: number | null;
  origenLongitud?: number | null;
  origenTelefono?: string;
}

export interface DetallePedido {
  id: number;
  pedidoId: number;
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

