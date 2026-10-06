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
  destacado?: boolean;

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
  diasRestantes?: number;
  alertaVencimiento?: boolean;
  comprobanteSuscripcionUrl?: string;
  motivoRechazoSuscripcion?: string;
  bancoNombre?: string;
  bancoTipoCuenta?: string;
  bancoNumeroCuenta?: string;
  bancoTitular?: string;
  bancoDocumento?: string;
  instruccionesPago?: string;
}

export interface ConfiguracionSuscripcion {
  id: number;
  freePrimaryStores: number;
  primaryFreePeriodMonths: number;
  primaryMonthlyPrice: number;
  additionalStoreActivationPrice: number;
  additionalStoreMonthlyPrice: number;
  allowNewStores: boolean;
  bancoNombre?: string;
  bancoTipoCuenta?: string;
  bancoNumeroCuenta?: string;
  bancoTitular?: string;
  bancoDocumento?: string;
  instruccionesPago?: string;
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
  destacado?: boolean;
  tipoPlan?: string;
  estadoSuscripcion?: string;
  fechaCreacion?: string;
  fechaInicioSuscripcion?: string;
  fechaVencimiento?: string;
  montoSuscripcion?: number;
  fechaUltimoPago?: string;
  referenciaPago?: string;
  departamentoId?: number;
  departamentoNombre?: string;
  municipioId?: number;
  municipioNombre?: string;
  totalSucursales?: number;
  totalProductos?: number;
  totalPedidos?: number;
  pedidosActivos?: number;
  eliminado?: boolean;
  diasRestantes?: number;
  alertaVencimiento?: boolean;
  comprobanteUrl?: string;
  comprobanteKey?: string;
  motivoRechazo?: string;
  revisadoPor?: string;
  revisadoEn?: string;
}

export interface SuscripcionResponse {
  id: number;
  comercioId: number;
  comercioNombre?: string;
  usuarioId: number;
  tipoPlan: string;
  estado: string;
  monto: number;
  periodo?: string;
  fechaInicio: string;
  fechaFin?: string;
  fechaPago?: string;
  referenciaPago?: string;
  comprobanteUrl?: string;
  comprobanteKey?: string;
  motivoRechazo?: string;
  revisadoPor?: string;
  revisadoEn?: string;
  esVencida?: boolean;
  diasRestantes?: number;
  alertaVencimiento?: boolean;
  bancoNombre?: string;
  bancoTipoCuenta?: string;
  bancoNumeroCuenta?: string;
  bancoTitular?: string;
  bancoDocumento?: string;
  instruccionesPago?: string;
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
