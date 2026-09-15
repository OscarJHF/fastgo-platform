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
