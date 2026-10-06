export type EstadoEncomienda = 
  | 'PENDIENTE' 
  | 'OFERTA'
  | 'ACEPTADA' 
  | 'EN_RECOGIDA' 
  | 'EN_CAMINO' 
  | 'ENTREGADA' 
  | 'CANCELADA';

export type EstadoOfertaEncomienda =
  | 'PENDIENTE'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'CANCELADA';

export interface OfertaEncomienda {
  id: number;
  encomiendaId: number;
  domiciliarioId: number;
  domiciliarioNombre?: string;
  domiciliarioTelefono?: string;
  valor: number;
  mensaje?: string;
  estado: EstadoOfertaEncomienda;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface CrearOfertaRequest {
  valor: number;
  mensaje?: string;
}

export interface Encomienda {
  id: number;
  clienteId: number;
  remitenteNombre: string;
  remitenteTelefono: string;
  direccionOrigen: string;
  origenLat?: number;
  origenLng?: number;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  direccionDestino: string;
  destinoLat?: number;
  destinoLng?: number;
  descripcion: string;
  tamanoPeso?: string;
  distanciaKm?: number;
  costoEnvio?: number;
  valorInicial?: number;
  numeroOfertas?: number;
  ofertas?: OfertaEncomienda[];
  tarifaAceptada?: boolean;
  domiciliarioId?: number;
  domiciliarioNombre?: string;
  estado: EstadoEncomienda;
  observaciones?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface CrearEncomiendaRequest {
  remitenteNombre: string;
  remitenteTelefono: string;
  direccionOrigen: string;
  origenLat?: number;
  origenLng?: number;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  direccionDestino: string;
  destinoLat?: number;
  destinoLng?: number;
  descripcion: string;
  tamanoPeso?: string;
  distanciaKm?: number;
  costoEnvio?: number;
  tarifaAceptada: boolean;
  observaciones?: string;
}

export interface CalcularTarifaRequest {
  origenLat?: number;
  origenLng?: number;
  destinoLat?: number;
  destinoLng?: number;
  distanciaKm?: number;
}

export interface TarifaResponse {
  distanciaKm: number;
  costoEnvio: number;
  tarifaBase: number;
  desglose: string;
}
