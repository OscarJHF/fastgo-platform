export interface Direccion {
  id: number;
  usuarioId?: number;
  alias: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  codigoPostal?: string;
  latitud?: number;
  longitud?: number;
  principal: boolean;
  creadoEn?: string;
}

export interface DireccionRequest {
  alias: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  codigoPostal?: string;
  latitud?: number;
  longitud?: number;
  principal?: boolean;
}
