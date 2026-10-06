import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  XCircle,
  Settings,
  History,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Trash2,
  MapPin,
  Building2,
  Boxes,
  ShoppingBag,
  FileCheck,
  Eye,
  Star,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { geografiaService } from '../../services/geografiaService';
import { AdminTienda, ConfiguracionSuscripcion, AuditoriaAdmin, Departamento, Municipio, SuscripcionResponse } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { APP_ROUTES } from '../../constants/routes';
import { formatCurrency } from '../../utils/formatters';

export const AdminCommercesPage: React.FC = () => {
  const { showToast } = useToast();
  const addToast = (type: 'success' | 'error' | 'warning' | 'info', msg: string) => showToast(msg, type);
  const [activeTab, setActiveTab] = useState<'tiendas' | 'comprobantes' | 'configuracion' | 'auditoria'>('tiendas');
  const [stores, setStores] = useState<AdminTienda[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<SuscripcionResponse[]>([]);
  const [config, setConfig] = useState<ConfiguracionSuscripcion | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditoriaAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('TODOS');

  // Filtros geográficos oficiales DANE
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepto, setSelectedDepto] = useState<string>('');
  const [selectedMuni, setSelectedMuni] = useState<string>('');

  // Modal de acción administrativa sobre tiendas
  const [selectedStore, setSelectedStore] = useState<AdminTienda | null>(null);
  const [actionType, setActionType] = useState<'activar' | 'desactivar' | 'suspender' | 'reactivar' | 'eliminar' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Modal de aprobación / rechazo de comprobante de suscripción
  const [selectedSub, setSelectedSub] = useState<SuscripcionResponse | null>(null);
  const [subActionType, setSubActionType] = useState<'aprobar' | 'rechazar' | null>(null);
  const [subRejectReason, setSubRejectReason] = useState('');
  const [isProcessingSub, setIsProcessingSub] = useState(false);

  // Formulario configuración
  const [configForm, setConfigForm] = useState<Partial<ConfiguracionSuscripcion>>({});
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [storesData, configData, auditData, pendingSubData] = await Promise.all([
        adminService.listStores().catch(() => []),
        adminService.getSubscriptionConfig().catch(() => null),
        adminService.listAuditLogs().catch(() => []),
        adminService.listPendingSubscriptions().catch(() => []),
      ]);
      setStores(storesData);
      setConfig(configData);
      if (configData) {
        setConfigForm(configData);
      }
      setAuditLogs(auditData);
      setPendingSubscriptions(pendingSubData);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error al cargar datos administrativos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    geografiaService.getDepartamentos().then(setDepartamentos).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDepto) {
      geografiaService.getMunicipiosPorDepartamento(selectedDepto)
        .then(setMunicipios)
        .catch(() => setMunicipios([]));
    } else {
      setMunicipios([]);
    }
    setSelectedMuni('');
  }, [selectedDepto]);

  const handleOpenAction = (store: AdminTienda, type: 'activar' | 'desactivar' | 'suspender' | 'reactivar' | 'eliminar') => {
    setSelectedStore(store);
    setActionType(type);
    setActionReason('');
  };

  const handleExecuteAction = async () => {
    if (!selectedStore || !actionType) return;
    setIsProcessingAction(true);
    try {
      if (actionType === 'activar') {
        await adminService.activateStore(selectedStore.id, actionReason);
        addToast('success', `Tienda "${selectedStore.nombre}" activada exitosamente`);
      } else if (actionType === 'desactivar') {
        await adminService.deactivateStore(selectedStore.id, actionReason);
        addToast('success', `Tienda "${selectedStore.nombre}" desactivada`);
      } else if (actionType === 'suspender') {
        await adminService.suspendStore(selectedStore.id, actionReason);
        addToast('warning', `Tienda "${selectedStore.nombre}" suspendida administrativamente`);
      } else if (actionType === 'reactivar') {
        await adminService.reactivateStore(selectedStore.id, actionReason);
        addToast('success', `Tienda "${selectedStore.nombre}" reactivada exitosamente`);
      } else if (actionType === 'eliminar') {
        await adminService.deleteStore(selectedStore.id, actionReason);
        addToast('success', `Tienda "${selectedStore.nombre}" eliminada lógicamente (soft-delete)`);
      }
      setSelectedStore(null);
      setActionType(null);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al ejecutar acción administrativa';
      addToast('error', msg);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleExecuteSubAction = async () => {
    if (!selectedSub || !subActionType) return;
    setIsProcessingSub(true);
    try {
      if (subActionType === 'aprobar') {
        await adminService.approveSubscription(selectedSub.id);
        addToast('success', `Suscripción de "${selectedSub.comercioNombre || selectedSub.comercioId}" aprobada y tienda activada`);
      } else if (subActionType === 'rechazar') {
        if (!subRejectReason.trim()) {
          addToast('error', 'Debes ingresar un motivo de rechazo claro');
          setIsProcessingSub(false);
          return;
        }
        await adminService.rejectSubscription(selectedSub.id, subRejectReason.trim());
        addToast('warning', `Comprobante rechazado: ${subRejectReason.trim()}`);
      }
      setSelectedSub(null);
      setSubActionType(null);
      setSubRejectReason('');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al procesar suscripción';
      addToast('error', msg);
    } finally {
      setIsProcessingSub(false);
    }
  };

  const handleToggleDestacado = async (store: AdminTienda) => {
    const nuevoDestacado = !store.destacado;
    if (nuevoDestacado && store.estado !== 'ACTIVA') {
      addToast('error', 'Solo se pueden destacar tiendas que se encuentren activas y operativas');
      return;
    }
    try {
      await adminService.toggleDestacado(store.id, nuevoDestacado);
      addToast('success', nuevoDestacado 
        ? `Tienda "${store.nombre}" marcada como destacada en el banner principal` 
        : `Tienda "${store.nombre}" retirada de tiendas destacadas`);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al modificar tienda destacada';
      addToast('error', msg);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const updated = await adminService.updateSubscriptionConfig({
        freePrimaryStores: Number(configForm.freePrimaryStores) || 1,
        primaryFreePeriodMonths: Number(configForm.primaryFreePeriodMonths) || 6,
        primaryMonthlyPrice: Number(configForm.primaryMonthlyPrice) || 20000,
        additionalStoreActivationPrice: Number(configForm.additionalStoreActivationPrice) || 50000,
        additionalStoreMonthlyPrice: Number(configForm.additionalStoreMonthlyPrice) || 30000,
        allowNewStores: Boolean(configForm.allowNewStores),
        bancoNombre: configForm.bancoNombre,
        bancoTipoCuenta: configForm.bancoTipoCuenta,
        bancoNumeroCuenta: configForm.bancoNumeroCuenta,
        bancoTitular: configForm.bancoTitular,
        bancoDocumento: configForm.bancoDocumento,
        instruccionesPago: configForm.instruccionesPago,
      });
      setConfig(updated);
      setConfigForm(updated);
      addToast('success', 'Parámetros y cuenta bancaria de suscripción actualizados');
      const audit = await adminService.listAuditLogs().catch(() => []);
      setAuditLogs(audit);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar configuración';
      addToast('error', msg);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'ACTIVA':
        return <Badge variant="success">ACTIVA</Badge>;
      case 'PENDIENTE_VERIFICACION':
        return <Badge variant="warning">PENDIENTE VERIFICACIÓN</Badge>;
      case 'PENDIENTE_ACTIVACION':
        return <Badge variant="warning">PENDIENTE ACTIVACIÓN</Badge>;
      case 'PENDIENTE_PAGO':
        return <Badge variant="warning">PENDIENTE PAGO</Badge>;
      case 'RECHAZADA':
        return <Badge variant="danger">RECHAZADA</Badge>;
      case 'SUSPENDIDA_POR_MORA':
        return <Badge variant="danger">MORA</Badge>;
      case 'SUSPENDIDA':
        return <Badge variant="danger">SUSPENDIDA</Badge>;
      case 'DESACTIVADA':
        return <Badge variant="secondary">DESACTIVADA</Badge>;
      case 'VENCIDA':
        return <Badge variant="danger">VENCIDA</Badge>;
      default:
        return <Badge variant="secondary">{estado || 'DESCONOCIDO'}</Badge>;
    }
  };

  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.propietarioNombre && s.propietarioNombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.propietarioCorreo && s.propietarioCorreo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesState =
      stateFilter === 'TODOS'
        ? true
        : stateFilter === 'DESTACADAS'
        ? Boolean(s.destacado)
        : s.estado?.toUpperCase() === stateFilter.toUpperCase();
    const matchesDepto = !selectedDepto || String(s.departamentoId) === String(selectedDepto);
    const matchesMuni = !selectedMuni || String(s.municipioId) === String(selectedMuni);
    return matchesSearch && matchesState && matchesDepto && matchesMuni;
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to={APP_ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de administración
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestión de Tiendas y Planes de Suscripción</h1>
          <p className="text-xs text-gray-500">
            Control administrativo unificado para multitiendas, activaciones, suspensión y parámetros de tarifas.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab('tiendas')}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'tiendas' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Store className="w-4 h-4" /> Tiendas ({stores.length})
        </button>
        <button
          onClick={() => setActiveTab('comprobantes')}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'comprobantes' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Comprobantes ({pendingSubscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('configuracion')}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'configuracion' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4" /> Configuración de Suscripciones
        </button>
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'auditoria' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" /> Auditoría ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: TIENDAS */}
      {activeTab === 'tiendas' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de tienda o comerciante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filtrar por Departamento"
                value={selectedDepto}
                onChange={(e) => setSelectedDepto(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">🇨🇴 Todos los Departamentos</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>

              {selectedDepto && (
                <select
                  aria-label="Filtrar por Municipio"
                  value={selectedMuni}
                  onChange={(e) => setSelectedMuni(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Todos los Municipios</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  aria-label="Filtrar por Estado"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="DESTACADAS">⭐ Tiendas Destacadas</option>
                  <option value="ACTIVA">Activas</option>
                  <option value="PENDIENTE_ACTIVACION">Pendientes de Activación</option>
                  <option value="PENDIENTE_PAGO">Pendientes de Pago</option>
                  <option value="SUSPENDIDA">Suspendidas</option>
                  <option value="DESACTIVADA">Desactivadas</option>
                </select>
              </div>
            </div>
          </div>

          {filteredStores.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No se encontraron tiendas que coincidan con los filtros aplicados.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStores.map((s) => (
                <Card key={s.id} className="p-5 flex flex-col justify-between space-y-4 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-gray-900">{s.nombre}</h3>
                          {s.esPrincipal ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                              Principal (Gratis 6m)
                            </span>
                          ) : (
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                              Tienda Adicional
                            </span>
                          )}
                          {s.destacado && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                              ⭐ Destacada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">ID Tienda: #{s.id} • {s.direccion || 'Dirección no registrada'}, {s.ciudad || 'Bogotá'}</p>
                      </div>
                      <div>{getStatusBadge(s.estado)}</div>
                    </div>

                    {/* Merchant / Owner Info */}
                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-gray-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" /> Propietario: {s.propietarioNombre || 'Sin nombre'}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {s.propietarioCorreo || 'Sin correo'}
                      </div>
                      {s.propietarioTelefono && (
                        <div className="text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {s.propietarioTelefono}
                        </div>
                      )}
                    </div>

                    {/* Subscription summary */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50/50 p-2 rounded border border-blue-100">
                        <span className="text-gray-500 block text-[10px]">Plan Suscripción</span>
                        <span className="font-bold text-gray-800">{s.tipoPlan || (s.esPrincipal ? 'TIENDA_PRINCIPAL' : 'TIENDA_ADICIONAL')}</span>
                      </div>
                      <div className="bg-green-50/50 p-2 rounded border border-green-100">
                        <span className="text-gray-500 block text-[10px]">Vencimiento</span>
                        <span className="font-bold text-gray-800">
                          {s.fechaVencimiento ? new Date(s.fechaVencimiento).toLocaleDateString('es-CO') : 'Sin vencimiento activo'}
                        </span>
                      </div>
                    </div>

                    {/* Indicadores Operativos y Geográficos DANE */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1 text-gray-500">
                      {s.departamentoNombre && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {s.municipioNombre || ''}, {s.departamentoNombre}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <Building2 className="w-3 h-3 text-blue-500" />
                        {s.totalSucursales ?? 0} sucursal(es)
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <Boxes className="w-3 h-3 text-indigo-500" />
                        {s.totalProductos ?? 0} producto(s)
                      </span>
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                        <ShoppingBag className="w-3 h-3 text-amber-500" />
                        {s.totalPedidos ?? 0} pedido(s)
                        {(s.pedidosActivos ?? 0) > 0 && (
                          <span className="font-bold text-amber-700 ml-0.5">({s.pedidosActivos} activos)</span>
                        )}
                      </span>
                      {s.eliminado && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                          ELIMINADA (SOFT-DELETE)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Administrative Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    {s.estado !== 'ACTIVA' && !s.eliminado && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenAction(s, 'activar')}
                        className="text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activar Tienda
                      </Button>
                    )}

                    {s.estado === 'ACTIVA' && !s.eliminado && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAction(s, 'suspender')}
                        className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 flex items-center gap-1"
                      >
                        <PauseCircle className="w-3.5 h-3.5" /> Suspender
                      </Button>
                    )}

                    {s.estado === 'SUSPENDIDA' && !s.eliminado && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAction(s, 'reactivar')}
                        className="text-xs text-green-700 bg-green-50 hover:bg-green-100 border-green-200 flex items-center gap-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" /> Reactivar
                      </Button>
                    )}

                    {s.estado !== 'DESACTIVADA' && !s.eliminado && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAction(s, 'desactivar')}
                        className="text-xs text-red-600 bg-red-50 hover:bg-red-100 border-red-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Desactivar
                      </Button>
                    )}

                    {!s.eliminado && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleDestacado(s)}
                        className={`text-xs flex items-center gap-1 font-semibold ${
                          s.destacado
                            ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                            : 'text-gray-700 bg-white hover:bg-amber-50 border-gray-200'
                        }`}
                        title={s.destacado ? 'Quitar del banner principal' : 'Destacar en el banner principal'}
                      >
                        <Star className={`w-3.5 h-3.5 ${s.destacado ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                        {s.destacado ? 'Destacada' : 'Destacar'}
                      </Button>
                    )}

                    {!s.eliminado && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleOpenAction(s, 'eliminar')}
                        className="text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 flex items-center gap-1 ml-auto"
                        title="Eliminación lógica segura"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONFIGURACIÓN DE SUSCRIPCIONES */}
      {activeTab === 'configuracion' && (
        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-gray-900">Parámetros Globales de Suscripción</h2>
              <p className="text-xs text-gray-500">
                Los cambios se aplicarán inmediatamente a las nuevas tiendas y renovaciones.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tiendas Principales Gratis por Usuario
                </label>
                <Input
                  type="number"
                  min="0"
                  value={configForm.freePrimaryStores || ''}
                  onChange={(e) => setConfigForm({ ...configForm, freePrimaryStores: Number(e.target.value) })}
                  required
                />
                <span className="text-[10px] text-gray-400">Por defecto: 1 tienda principal</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Meses Gratis Tienda Principal
                </label>
                <Input
                  type="number"
                  min="0"
                  value={configForm.primaryFreePeriodMonths || ''}
                  onChange={(e) => setConfigForm({ ...configForm, primaryFreePeriodMonths: Number(e.target.value) })}
                  required
                />
                <span className="text-[10px] text-gray-400">Por defecto: 6 meses gratis</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Precio Mensual Tienda Principal ($ COP)
                </label>
                <Input
                  type="number"
                  step="1000"
                  min="0"
                  value={configForm.primaryMonthlyPrice || ''}
                  onChange={(e) => setConfigForm({ ...configForm, primaryMonthlyPrice: Number(e.target.value) })}
                  required
                />
                <span className="text-[10px] text-gray-400">Tarifa tras vencer los 6 meses (ej. $20.000)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tarifa Activación Tienda Adicional ($ COP)
                </label>
                <Input
                  type="number"
                  step="1000"
                  min="0"
                  value={configForm.additionalStoreActivationPrice || ''}
                  onChange={(e) => setConfigForm({ ...configForm, additionalStoreActivationPrice: Number(e.target.value) })}
                  required
                />
                <span className="text-[10px] text-gray-400">Costo inicial único para tiendas adicionales (ej. $50.000)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mensualidad Tienda Adicional ($ COP)
                </label>
                <Input
                  type="number"
                  step="1000"
                  min="0"
                  value={configForm.additionalStoreMonthlyPrice || ''}
                  onChange={(e) => setConfigForm({ ...configForm, additionalStoreMonthlyPrice: Number(e.target.value) })}
                  required
                />
                <span className="text-[10px] text-gray-400">Costo mensual para tiendas adicionales (ej. $30.000)</span>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="allowNewStores"
                  checked={Boolean(configForm.allowNewStores)}
                  onChange={(e) => setConfigForm({ ...configForm, allowNewStores: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="allowNewStores" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Permitir Registro de Nuevas Tiendas
                </label>
              </div>

              {/* FastGo Bank Details */}
              <div className="pt-4 border-t border-gray-100 sm:col-span-2 space-y-3">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" /> Cuenta Bancaria Oficial de FASTGO
                </h3>
                <p className="text-[11px] text-gray-500">
                  Estos datos serán visibles para los comercios en el momento de pagar mensualidades o activar tiendas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Banco</label>
                    <Input
                      value={configForm.bancoNombre || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bancoNombre: e.target.value })}
                      placeholder="Bancolombia / Nequi"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Cuenta</label>
                    <select
                      value={configForm.bancoTipoCuenta || 'Ahorros'}
                      onChange={(e) => setConfigForm({ ...configForm, bancoTipoCuenta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Ahorros">Cuenta de Ahorros</option>
                      <option value="Corriente">Cuenta Corriente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Número de Cuenta</label>
                    <Input
                      value={configForm.bancoNumeroCuenta || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bancoNumeroCuenta: e.target.value })}
                      placeholder="999-888777-11"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Titular de la Cuenta</label>
                    <Input
                      value={configForm.bancoTitular || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bancoTitular: e.target.value })}
                      placeholder="FastGo S.A.S."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Documento / NIT</label>
                    <Input
                      value={configForm.bancoDocumento || ''}
                      onChange={(e) => setConfigForm({ ...configForm, bancoDocumento: e.target.value })}
                      placeholder="NIT 901.888.777-1"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Instrucciones de Pago</label>
                    <Input
                      value={configForm.instruccionesPago || ''}
                      onChange={(e) => setConfigForm({ ...configForm, instruccionesPago: e.target.value })}
                      placeholder="Instrucciones para transferencias..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit" variant="primary" isLoading={isSavingConfig}>
                Guardar Configuración
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB COMPROBANTES: VERIFICACIÓN DE PAGOS */}
      {activeTab === 'comprobantes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" /> Comprobantes Pendientes de Verificación
              </h2>
              <p className="text-xs text-gray-500">
                Revisa los comprobantes transferidos por los comerciantes para activar tiendas o renovar periodos.
              </p>
            </div>
            <Badge variant={pendingSubscriptions.length > 0 ? 'warning' : 'success'}>
              {pendingSubscriptions.length} pendientes
            </Badge>
          </div>

          {pendingSubscriptions.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-gray-700">¡Al día! No hay comprobantes pendientes</p>
              <p className="text-xs mt-1">Todos los pagos de activación y suscripción han sido procesados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSubscriptions.map((sub) => (
                <Card key={sub.id} className="p-4 space-y-3 border-l-4 border-l-amber-500">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {sub.comercioNombre || `Tienda #${sub.comercioId}`}
                      </h3>
                      <p className="text-xs text-gray-500">ID Suscripción: #{sub.id} • ID Tienda: #{sub.comercioId}</p>
                    </div>
                    <Badge variant="warning">PENDIENTE VERIFICACIÓN</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold">Monto / Plan:</span>
                      <strong className="text-purple-700">{formatCurrency(sub.monto)}</strong>
                      <span className="text-[10px] text-gray-500 block">{sub.tipoPlan}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold">Referencia:</span>
                      <strong className="text-gray-800">{sub.referenciaPago || 'Sin ref'}</strong>
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(sub.fechaInicio || (sub as any).creadoEn || Date.now()).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <a
                      href={`/api/admin/suscripciones/${sub.id}/comprobante`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver Comprobante
                    </a>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedSub(sub);
                          setSubActionType('rechazar');
                          setSubRejectReason('');
                        }}
                        className="text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
                      >
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setSelectedSub(sub);
                          setSubActionType('aprobar');
                        }}
                        className="text-xs"
                      >
                        Aprobar y Activar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDITORÍA */}
      {activeTab === 'auditoria' && (
        <Card className="p-6 overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-black text-gray-900">Registro de Auditoría de Administración</h2>
            <p className="text-xs text-gray-500">Historial inmutable de operaciones y cambios de configuración.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Administrador</th>
                  <th className="py-2.5 px-3">Acción</th>
                  <th className="py-2.5 px-3">Entidad / ID</th>
                  <th className="py-2.5 px-3">Cambio</th>
                  <th className="py-2.5 px-3">Motivo / Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-500">
                      {new Date(log.fecha).toLocaleString('es-CO')}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-800">{log.adminCorreo}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {log.entidad} #{log.entidadId}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {log.valorAnterior && <span className="line-through text-red-500 mr-1">{log.valorAnterior}</span>}
                      {log.valorNuevo && <span className="text-green-600 font-bold">{log.valorNuevo}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">{log.detalles || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal para acciones administrativas (activar, suspender, eliminar, etc.) */}
      {selectedStore && actionType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedStore(null);
            setActionType(null);
          }}
          title={
            actionType === 'eliminar'
              ? 'Eliminar Tienda (Desactivación Segura)'
              : `Confirmar Acción Administrativa: ${actionType.toUpperCase()}`
          }
        >
          <div className="space-y-4">
            {actionType === 'eliminar' ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Advertencia de Eliminación Segura (Soft-Delete)
                  </div>
                  <p>
                    Vas a eliminar la tienda <strong>"{selectedStore.nombre}"</strong>. Esta acción desactiva la tienda y previene nuevas operaciones, sin destruir el historial de ventas ni la base de datos.
                  </p>
                </div>

                {/* Métricas del comercio antes de eliminar */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5">
                  <div className="font-bold text-gray-700">Métricas operativas asociadas:</div>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <div>• Sucursales: <strong>{selectedStore.totalSucursales ?? 0}</strong></div>
                    <div>• Productos: <strong>{selectedStore.totalProductos ?? 0}</strong></div>
                    <div>• Total Pedidos: <strong>{selectedStore.totalPedidos ?? 0}</strong></div>
                    <div>• Pedidos Activos: <strong className={(selectedStore.pedidosActivos ?? 0) > 0 ? 'text-amber-600' : ''}>{selectedStore.pedidosActivos ?? 0}</strong></div>
                  </div>
                  {selectedStore.departamentoNombre && (
                    <div className="text-[11px] text-gray-500 pt-1">
                      Ubicación: {selectedStore.municipioNombre || ''}, {selectedStore.departamentoNombre}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que deseas <strong>{actionType}</strong> la tienda{' '}
                <strong>"{selectedStore.nombre}"</strong>?
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Motivo o Razón Administrativa (quedará registrado en auditoría):
              </label>
              <Input
                type="text"
                placeholder={
                  actionType === 'eliminar'
                    ? 'Ej. Solicitud expresa del propietario / Cierre definitivo...'
                    : 'Ej. Pago verificado / Suspensión por mora / Reactivación...'
                }
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedStore(null);
                  setActionType(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant={actionType === 'eliminar' ? 'danger' : 'primary'}
                onClick={handleExecuteAction}
                isLoading={isProcessingAction}
              >
                {actionType === 'eliminar' ? 'Confirmar Eliminación Segura' : `Confirmar ${actionType}`}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Aprobación / Rechazo Comprobante Suscripción */}
      {selectedSub && subActionType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedSub(null);
            setSubActionType(null);
          }}
          title={subActionType === 'aprobar' ? 'Aprobar Pago y Activar Tienda' : 'Rechazar Comprobante de Pago'}
          maxWidth="md"
        >
          <div className="space-y-4">
            {subActionType === 'aprobar' ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-bold text-sm text-emerald-900">¿Confirmar la aprobación de este pago?</p>
                <p>
                  Tienda: <strong>{selectedSub.comercioNombre || selectedSub.comercioId}</strong>
                </p>
                <p>
                  Monto: <strong>{formatCurrency(selectedSub.monto)}</strong> • Plan: <strong>{selectedSub.tipoPlan}</strong>
                </p>
                <p className="text-emerald-800 pt-1">
                  Al aprobar, la tienda quedará en estado <strong>ACTIVA</strong> y visible de inmediato para recibir pedidos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                  <p className="font-bold text-sm text-rose-900">Rechazar comprobante</p>
                  <p>
                    La tienda permanecerá inactiva y el comerciante recibirá el motivo ingresado para corregir su comprobante.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Motivo del rechazo (visible para el comerciante) *
                  </label>
                  <Input
                    placeholder="Ej. Valor transferido insuficiente / Comprobante ilegible / Transferencia no recibida..."
                    value={subRejectReason}
                    onChange={(e) => setSubRejectReason(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedSub(null);
                  setSubActionType(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant={subActionType === 'aprobar' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleExecuteSubAction}
                isLoading={isProcessingSub}
              >
                {subActionType === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
