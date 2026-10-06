import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Utensils,
  ShoppingBag,
  MapPin,
  Clock,
  Building2,
  Settings,
  Sparkles,
  Package,
  Eye,
  EyeOff,
  Power,
  Bell,
} from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { pedidoService } from '../../services/pedidoService';
import { Comercio, Sucursal, Pedido } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { APP_ROUTES } from '../../constants/routes';
import { useMerchantStore } from '../../context/MerchantStoreContext';
import { StoreSwitcher } from '../../components/commerce/StoreSwitcher';

export const CommerceDashboardPage: React.FC = () => {
  const { stores, selectedStore, refreshStores, isLoading: isStoresLoading } = useMerchantStore();
  const [activeCommerce, setActiveCommerce] = useState<Comercio | null>(null);
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [activeBranch, setActiveBranch] = useState<Sucursal | null>(null);
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  useEffect(() => {
    if (selectedStore) {
      setActiveCommerce(selectedStore);
      setIsLoading(true);
      (async () => {
        try {
          const sucs = await sucursalService.listByCommerce(selectedStore.id).catch(() => []);
          setBranches(sucs);
          if (sucs.length > 0) {
            setActiveBranch(sucs[0]);
            const ords = await pedidoService.listBySucursal(sucs[0].id).catch(() => []);
            setOrders(ords);
          } else {
            setActiveBranch(null);
            setOrders([]);
          }
        } catch (err) {
          console.error('Error cargando sucursales/pedidos:', err);
        } finally {
          setIsLoading(false);
        }
      })();
    } else if (!isStoresLoading && stores.length === 0) {
      setActiveCommerce(null);
      setBranches([]);
      setOrders([]);
      setIsLoading(false);
    }
  }, [selectedStore, isStoresLoading, stores.length]);

  // Polling automático en segundo plano cada 12 segundos para mantener contadores actualizados
  useEffect(() => {
    if (!activeBranch) return;
    const interval = setInterval(() => {
      pedidoService
        .listBySucursal(activeBranch.id)
        .then((ords) => setOrders(ords))
        .catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, [activeBranch]);

  const handleTogglePause = async () => {
    if (!activeCommerce) return;
    setIsTogglingPause(true);
    try {
      const nuevoEstado = !activeCommerce.pausaManual;
      const updated = await commerceService.togglePausaManual(activeCommerce.id, nuevoEstado);
      setActiveCommerce(updated);
      await refreshStores();
    } catch (err) {
      console.error('Error al cambiar pausa manual:', err);
    } finally {
      setIsTogglingPause(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'CONFIRMADO').length;
  const preparingCount = orders.filter((o) => o.estado === 'EN_PREPARACION').length;
  const readyCount = orders.filter((o) => o.estado === 'LISTO_PARA_ENTREGA').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Panel de Administración de Comercio</h1>
          <p className="text-xs text-gray-500">
            {activeCommerce
              ? `Gestionando: ${activeCommerce.nombre} • ${activeCommerce.categoria || 'Comercio Aliado'}`
              : 'Bienvenido al ecosistema comercial FASTGO'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeCommerce && (
            <>
              <Link to={APP_ROUTES.COMMERCE_STORE}>
                <Button variant="secondary" size="sm" icon={<Settings className="w-4 h-4" />}>
                  Configurar Tienda
                </Button>
              </Link>
              <Link to={APP_ROUTES.COMMERCE_ORDERS}>
                <Button variant="primary" size="sm" icon={<ShoppingBag className="w-4 h-4" />}>
                  Ver Pedidos
                </Button>
              </Link>
              <Link to={APP_ROUTES.COMMERCE_PRODUCTS}>
                <Button variant="secondary" size="sm" icon={<Package className="w-4 h-4" />}>
                  Productos
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Multi-Store Switcher */}
      <StoreSwitcher />

      {/* Alerta de pedidos pendientes en cocina */}
      {activeCommerce && pendingCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-950">
                Tienes {pendingCount} pedido{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} esperando en cocina
              </p>
              <p className="text-xs text-emerald-700">
                Revisa clientes, empaca productos y despacha a domiciliarios para evitar demoras.
              </p>
            </div>
          </div>
          <Link to={APP_ROUTES.COMMERCE_ORDERS} className="shrink-0">
            <Button size="sm" variant="primary">
              Atender Cocina ({pendingCount})
            </Button>
          </Link>
        </div>
      )}

      {/* When commerce is not yet configured: Onboarding Wizard Banner */}
      {!activeCommerce ? (
        <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-purple-500/10 via-white to-emerald-500/10 border-2 border-dashed border-purple-200 rounded-3xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-black text-gray-900">¡Configura tu Tienda en FASTGO!</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Crea tu perfil comercial, ingresa el nombre de tu tienda, sector (restaurante, ropa, fruver, tecnología, supermercado, etc.), dirección de recogida y horarios para comenzar a vender.
            </p>
          </div>
          <div className="pt-2">
            <Link to={APP_ROUTES.COMMERCE_STORE}>
              <Button variant="primary" size="lg" icon={<Sparkles className="w-5 h-5" />}>
                Crear y Configurar Mi Tienda
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Control Visual Claro y Dedicado: ABRIR TIENDA / CERRAR TIENDA */}
          <div className={`p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
            activeCommerce.abierto
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-rose-50/60 border-rose-300'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white shadow-md ${
                activeCommerce.abierto ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
              }`}>
                <Store className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ESTADO COMERCIAL:</span>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${
                    activeCommerce.abierto
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {activeCommerce.abierto ? '● TIENDA ABIERTA' : '○ TIENDA CERRADA'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {activeCommerce.mensajeEstado || (activeCommerce.abierto ? 'Recibiendo pedidos con normalidad' : 'No se recibirán pedidos')}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                  <span>Horario: <strong>{activeCommerce.horaApertura || '08:00'} - {activeCommerce.horaCierre || '20:00'}</strong></span>
                  <span>•</span>
                  <span>Días: <strong>{activeCommerce.diasAtencion || 'Todos los días'}</strong></span>
                  <span>•</span>
                  <span>Dentro de horario: <strong>{activeCommerce.dentroDeHorario ? 'Sí' : 'No'}</strong></span>
                  {activeCommerce.pausaManual && (
                    <>
                      <span>•</span>
                      <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">Pausa manual activa</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTogglePause}
              disabled={isTogglingPause}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                activeCommerce.abierto
                  ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-600/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30'
              }`}
            >
              <Power className="w-4 h-4" />
              {isTogglingPause
                ? 'Actualizando...'
                : activeCommerce.abierto
                ? 'CERRAR TIENDA (Pausar)'
                : 'ABRIR TIENDA (Reanudar)'}
            </button>
          </div>

          {/* Operational & Visibility Status Card */}
          <div className="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 overflow-hidden">
                  {activeCommerce.logo ? (
                    <img src={activeCommerce.logo} alt={activeCommerce.nombre} className="w-full h-full object-cover" />
                  ) : (
                    activeCommerce.nombre.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-gray-900">{activeCommerce.nombre}</h2>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        activeCommerce.pausaManual
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : activeCommerce.abierto !== false
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {activeCommerce.pausaManual
                        ? 'Pausa Manual'
                        : activeCommerce.abierto !== false
                        ? 'Abierto'
                        : 'Cerrado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeCommerce.descripcion || 'Comercio aliado FASTGO'}
                  </p>
                </div>
              </div>

              {/* Public visibility status */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    activeCommerce.activo
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {activeCommerce.activo ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" /> Publicada para Clientes
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" /> Oculta / Borrador
                    </>
                  )}
                </span>
                <Link to={APP_ROUTES.COMMERCE_STORE}>
                  <Button variant="outline" size="sm">
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">
                  {activeCommerce.direccion
                    ? `${activeCommerce.direccion}, ${activeCommerce.ciudad || 'Bogotá'}`
                    : 'Dirección principal configurada'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>
                  Horario: {activeCommerce.horaApertura || '08:00'} - {activeCommerce.horaCierre || '20:00'} (~
                  {activeCommerce.tiempoPreparacionMin || 25} min prep)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">
                  {branches.length} {branches.length === 1 ? 'Sede activa' : 'Sedes activas'}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-l-4 border-l-amber-500">
              <p className="text-xs font-bold uppercase text-gray-400">Por Confirmar</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{pendingCount}</p>
              <p className="text-xs text-amber-600 mt-1">Requieren atención inmediata</p>
            </Card>

            <Card className="p-5 border-l-4 border-l-purple-500">
              <p className="text-xs font-bold uppercase text-gray-400">En Preparación / Alistamiento</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{preparingCount}</p>
              <p className="text-xs text-purple-600 mt-1">Empacando productos</p>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-500">
              <p className="text-xs font-bold uppercase text-gray-400">Listos para Domiciliario</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{readyCount}</p>
              <p className="text-xs text-emerald-600 mt-1">Esperando recogida</p>
            </Card>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={APP_ROUTES.COMMERCE_STORE}>
              <Card hoverable className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-gray-900">Mi Tienda</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Configura nombre, sector, fotos, horarios y visibilidad para clientes.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-700 mt-4 inline-block">Configurar perfil →</span>
              </Card>
            </Link>

            <Link to={APP_ROUTES.COMMERCE_PRODUCTS}>
              <Card hoverable className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-gray-900">Catálogo de Productos</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Agrega productos de cualquier sector, gestiona precios, stock y categorías.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 mt-4 inline-block">Gestionar catálogo →</span>
              </Card>
            </Link>

            <Link to={APP_ROUTES.COMMERCE_ORDERS}>
              <Card hoverable className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-gray-900">Gestión de Pedidos</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Acepta pedidos en tiempo real, prepara el paquete y despacha con domiciliario.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 mt-4 inline-block">Ver pedidos →</span>
              </Card>
            </Link>

            <Link to={APP_ROUTES.COMMERCE_BRANCHES}>
              <Card hoverable className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-base text-gray-900">Sedes y Sucursales</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Gestiona direcciones físicas, puntos de despacho y radios de entrega.
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 mt-4 inline-block">Gestionar sedes →</span>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
