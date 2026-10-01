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
  direccion?: string;
  ciudad?: string;
  metodosPago?: string;
  horaApertura?: string;
  horaCierre?: string;
  diasAtencion?: string;
  tiempoPreparacionMin?: number;
  pausaManual?: boolean;
  abierto?: boolean;
  estadoHorario?: string;
  dentroDeHorario?: boolean;
  mensajeEstado?: string;
  tarifaDomicilio?: number;
  bancolombiaActivo?: boolean;
  bancolombiaTipoCuenta?: string;
  bancolombiaNumeroCuenta?: string;
  bancolombiaTitular?: string;
  bancolombiaDocTitular?: string;

  // Multi-store & subscriptions
  esPrincipal?: boolean;
  estado?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  usuarioCorreo?: string;
  creadoEn?: string;
  fechaInicioSuscripcion?: string;
  fechaFinSuscripcion?: string;
  tipoPlan?: string;
  estadoSuscripcion?: string;
  precioMensual?: number;
  precioActivacion?: number;
  esGratuito?: boolean;
}

export interface ConfiguracionSuscripcion {
  id: number;
  freePrimaryStores: number;
  primaryFreePeriodMonths: number;
  primaryMonthlyPrice: number;
  additionalStoreActivationPrice: number;
  additionalStoreMonthlyPrice: number;
  allowNewStores: boolean;
  actualizadoPor?: string;
  actualizadoEn?: string;
}

export interface AdminTienda {
  id: number;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  usuarioId?: number;
  propietarioNombre?: string;
  propietarioCorreo?: string;
  propietarioTelefono?: string;
  esPrincipal?: boolean;
  estado: string;
  activo: boolean;
  tipoPlan?: string;
  estadoSuscripcion?: string;
  fechaCreacion?: string;
  fechaInicioSuscripcion?: string;
  fechaVencimiento?: string;
  montoSuscripcion?: number;
  fechaUltimoPago?: string;
  referenciaPago?: string;
}

export interface AuditoriaAdmin {
  id: number;
  adminCorreo: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  detalles?: string;
  fecha: string;
}

export interface ComercioRequest {
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
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
  tarifaDomicilio?: number;
  bancolombiaActivo?: boolean;
  bancolombiaTipoCuenta?: string;
  bancolombiaNumeroCuenta?: string;
  bancolombiaTitular?: string;
  bancolombiaDocTitular?: string;
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
