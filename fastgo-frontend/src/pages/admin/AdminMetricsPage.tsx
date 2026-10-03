import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  Smartphone,
  UserPlus,
  ShoppingBag,
  CheckCircle2,
  TrendingUp,
  Globe,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsMetricsResponse } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { APP_ROUTES } from '../../constants/routes';

export const AdminMetricsPage: React.FC = () => {
  const { showToast } = useToast();
  const [periodo, setPeriodo] = useState<string>('7_DIAS');
  const [metrics, setMetrics] = useState<AnalyticsMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const loadMetrics = async (selectedPeriod: string) => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getMetrics(selectedPeriod);
      setMetrics(data);
    } catch (err: any) {
      console.error('Error cargando métricas:', err);
      showToast('Error cargando analítica centralizada', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics(periodo);
  }, [periodo]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await analyticsService.exportCsv(periodo);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fastgo_analytics_${periodo.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Archivo CSV exportado exitosamente', 'success');
    } catch (err: any) {
      console.error('Error exportando CSV:', err);
      showToast('Error al exportar CSV de métricas', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const periodOptions = [
    { label: 'Hoy', value: 'HOY' },
    { label: 'Últimos 7 Días', value: '7_DIAS' },
    { label: 'Últimos 30 Días', value: '30_DIAS' },
    { label: 'Histórico Total', value: 'TODO' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to={APP_ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de administración
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900">Analítica Central FASTGO</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              <Clock className="w-3 h-3" /> America/Bogota
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Métricas de adquisición, descarga de APK, primeras aperturas en Android y embudo de conversión a pedidos.
          </p>
        </div>

        {/* Controls: Periods & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriodo(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  periodo === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCsv}
            isLoading={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Exportar CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadMetrics(periodo)}
            isLoading={isLoading}
            className="flex items-center gap-1 text-xs font-bold bg-white border border-gray-200 shadow-sm"
            title="Refrescar métricas"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
          </Button>
        </div>
      </div>

      {isLoading && !metrics ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <Card className="p-4 bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">Visitas</span>
                <Eye className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-xl font-black text-slate-900">{metrics?.resumen?.totalVisitas ?? 0}</div>
              <span className="text-[10px] text-slate-400">Total páginas</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-sm">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-[11px] font-bold">Descarga</span>
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-blue-900">{metrics?.resumen?.visitasDescarga ?? 0}</div>
              <span className="text-[10px] text-blue-500">Visitas /descargar</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100 shadow-sm">
              <div className="flex items-center justify-between text-indigo-600 mb-1">
                <span className="text-[11px] font-bold">APK Descargado</span>
                <Download className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-indigo-900">{metrics?.resumen?.descargasApk ?? 0}</div>
              <span className="text-[10px] text-indigo-500">GET /descargar/apk</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50/50 to-white border-purple-100 shadow-sm">
              <div className="flex items-center justify-between text-purple-600 mb-1">
                <span className="text-[11px] font-bold">Aperturas App</span>
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-purple-900">{metrics?.resumen?.primerasAperturasApp ?? 0}</div>
              <span className="text-[10px] text-purple-500">Dispositivos únicos</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-50/50 to-white border-amber-100 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 mb-1">
                <span className="text-[11px] font-bold">Registros</span>
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-amber-900">{metrics?.resumen?.registros ?? 0}</div>
              <span className="text-[10px] text-amber-600">Nuevas cuentas</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-teal-50/50 to-white border-teal-100 shadow-sm">
              <div className="flex items-center justify-between text-teal-600 mb-1">
                <span className="text-[11px] font-bold">Pedidos</span>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-teal-900">{metrics?.resumen?.pedidosCreados ?? 0}</div>
              <span className="text-[10px] text-teal-600">Creados</span>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-[11px] font-bold">Entregados</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-emerald-900">{metrics?.resumen?.pedidosEntregados ?? 0}</div>
              <span className="text-[10px] text-emerald-600">Completados</span>
            </Card>
          </div>

          {/* Embudo de Conversión */}
          <Card className="p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Embudo de Conversión (Funnel de Adquisición a Entrega)
                </h2>
                <p className="text-xs text-gray-500">
                  Porcentaje de conversión calculado dinámicamente etapa tras etapa con protección contra división por cero.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {(metrics?.embudo || []).map((step, idx) => {
                const widthPercent = Math.max(step.tasaConversion || 0, 4);
                return (
                  <div key={step.etapa} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">
                        {idx + 1}. {step.etapa}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-gray-900 font-bold">{step.cantidad}</span>
                        <span className="text-gray-400 text-[11px]">
                          ({Number(step.tasaConversion || 0).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(widthPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Grilla: Tendencias Diarias y Fuentes de Tráfico */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tendencias Diarias (2 columnas) */}
            <Card className="p-5 border border-gray-100 shadow-sm space-y-3 lg:col-span-2 overflow-hidden">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-600" /> Tendencia Diaria de Eventos
              </h3>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-black text-[10px]">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3 text-center">Visitas</th>
                      <th className="py-2.5 px-3 text-center">Descargas</th>
                      <th className="py-2.5 px-3 text-center">Aperturas App</th>
                      <th className="py-2.5 px-3 text-center">Pedidos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(metrics?.tendencias || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          Sin eventos registrados para el período seleccionado.
                        </td>
                      </tr>
                    ) : (
                      metrics?.tendencias.map((t) => (
                        <tr key={t.fecha} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 font-mono font-bold text-gray-800">{t.fecha}</td>
                          <td className="py-2 px-3 text-center font-mono">{t.visitas}</td>
                          <td className="py-2 px-3 text-center font-mono text-indigo-600 font-bold">{t.descargas}</td>
                          <td className="py-2 px-3 text-center font-mono text-purple-600 font-bold">{t.primerasAperturas}</td>
                          <td className="py-2 px-3 text-center font-mono text-emerald-600 font-bold">{t.pedidos}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Fuentes de Tráfico (1 columna) */}
            <Card className="p-5 border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" /> Origen de Tráfico (UTM)
              </h3>
              <div className="space-y-3 pt-2">
                {(metrics?.fuentesTrafico || []).length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">Sin fuentes registradas</p>
                ) : (
                  metrics?.fuentesTrafico.map((src) => (
                    <div key={src.origen} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800 truncate max-w-[150px]">{src.origen}</span>
                        <span className="text-gray-500 font-mono text-[11px]">
                          {src.cantidad} ({Number(src.porcentaje || 0).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(src.porcentaje || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
