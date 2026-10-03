export interface AnalyticsEventPayload {
  eventType: 'PAGE_VIEW' | 'DOWNLOAD_PAGE_VIEW' | 'APK_DOWNLOAD' | 'APP_FIRST_OPEN' | 'REGISTER' | 'LOGIN' | 'ORDER_CREATED' | 'ORDER_DELIVERED' | string;
  anonymousId?: string;
  userId?: number;
  platform?: 'WEB' | 'ANDROID' | string;
  appVersion?: string;
  pathOrScreen?: string;
  utmSource?: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsSummary {
  totalVisitas: number;
  visitasDescarga: number;
  descargasApk: number;
  primerasAperturasApp: number;
  registros: number;
  pedidosCreados: number;
  pedidosEntregados: number;
}

export interface ConversionStep {
  etapa: string;
  cantidad: number;
  tasaConversion: number; // percentage (0 - 100)
}

export interface DailyTrend {
  fecha: string;
  visitas: number;
  descargas: number;
  primerasAperturas: number;
  pedidos: number;
}

export interface TrafficSource {
  origen: string;
  cantidad: number;
  porcentaje: number;
}

export interface AnalyticsMetricsResponse {
  periodo: 'HOY' | '7_DIAS' | '30_DIAS' | 'TODO' | string;
  zonaHoraria: string;
  resumen: AnalyticsSummary;
  embudo: ConversionStep[];
  tendencias: DailyTrend[];
  fuentesTrafico: TrafficSource[];
}
