export interface Departamento {
  id: number;
  codigoDane: string;
  nombre: string;
}

export interface Municipio {
  id: number;
  departamentoId: number;
  codigoDane: string;
  nombre: string;
  latitud?: number;
  longitud?: number;
}
