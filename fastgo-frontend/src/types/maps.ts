export interface MapsConfig {
  enabled: boolean;
  clientApiKey?: string;
  provider?: string;
}

export interface MapGeocodeRequest {
  address: string;
}

export interface MapRouteRequest {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

export interface TrackingUbicacionRequest {
  pedidoId: number;
  latitud: number;
  longitud: number;
  precision?: number;
  rumbo?: number;
  velocidad?: number;
}

export interface TrackingResponse {
  id: number;
  pedidoId: number;
  domiciliarioId?: number;
  latitud: number;
  longitud: number;
  precision?: number;
  rumbo?: number;
  velocidad?: number;
  fechaHora: string;
  estadoPedido: string;
}
