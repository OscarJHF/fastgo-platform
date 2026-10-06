import React, { useEffect, useState } from 'react';
import {
  Bike,
  Package,
  Check,
  ArrowRight,
  Navigation,
  MapPin,
  Layers,
  Clock,
  Send,
  ShieldCheck,
  DollarSign,
  Store,
  Building2,
  Volume2,
  VolumeX,
  Bell,
  MessageSquare,
  X,
} from 'lucide-react';
import { soundPlayer } from '../../utils/soundPlayer';
import { pedidoService } from '../../services/pedidoService';
import { encomiendaService } from '../../services/encomiendaService';
import { trackingService } from '../../services/trackingService';
import { Pedido, Encomienda, EstadoEncomienda, OfertaEncomienda } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS } from '../../constants/orderStatus';
import { parseApiError } from '../../utils/errorHandler';

export const DeliveryDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'encomiendas'>('pedidos');
  const [availableOrders, setAvailableOrders] = useState<Pedido[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Pedido[]>([]);

  const [availableEncomiendas, setAvailableEncomiendas] = useState<Encomienda[]>([]);
  const [myEncomiendas, setMyEncomiendas] = useState<Encomienda[]>([]);
  const [mySentOffers, setMySentOffers] = useState<OfertaEncomienda[]>([]);

  // Modal de contraoferta
  const [ofertaModalEnc, setOfertaModalEnc] = useState<Encomienda | null>(null);
  const [ofertaValor, setOfertaValor] = useState<number | ''>('');
  const [ofertaMensaje, setOfertaMensaje] = useState<string>('');
  const [isSubmittingOferta, setIsSubmittingOferta] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);

  // Notificaciones de despachos disponibles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fastgo_delivery_sound_enabled') !== 'false';
  });
  const [newDeliveryAlert, setNewDeliveryAlert] = useState<Pedido | null>(null);
  const knownAvailableOrderIdsRef = React.useRef<Set<number>>(new Set());
  const isFirstLoadRef = React.useRef<boolean>(true);

  const { success, error: showError } = useToast();

  const loadDeliveryData = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [available, myOrds, availEnc, myEnc, myOffers] = await Promise.all([
        pedidoService.listAvailableForDelivery().catch(() => []),
        pedidoService.listMyDeliveries().catch(() => []),
        encomiendaService.listarDisponibles().catch(() => []),
        encomiendaService.listarAsignadas().catch(() => []),
        encomiendaService.misOfertas().catch(() => []),
      ]);
      setAvailableOrders(available);
      setMyDeliveries(myOrds);
      setAvailableEncomiendas(availEnc);
      setMyEncomiendas(myEnc);
      setMySentOffers(myOffers);

      // Detectar nuevos despachos disponibles listos para entrega
      if (!isFirstLoadRef.current) {
        const newlyAvailable = available.filter(
          (o) => !knownAvailableOrderIdsRef.current.has(o.id)
        );
        if (newlyAvailable.length > 0) {
          const latest = newlyAvailable[0];
          setNewDeliveryAlert(latest);
          if (soundEnabled) {
            soundPlayer.playDeliveryAlertSound();
          }
        }
      }

      available.forEach((o) => knownAvailableOrderIdsRef.current.add(o.id));
      isFirstLoadRef.current = false;
    } catch (err) {
      console.error(err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryData(true);
  }, []);

  // Polling automático cada 10 segundos para nuevos despachos
  useEffect(() => {
    const interval = setInterval(() => {
      loadDeliveryData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Telemetría GPS en tiempo real para pedidos en ruta (EN_CAMINO)
  useEffect(() => {
    const activeRouteOrder = myDeliveries.find((p) => p.estado === 'EN_CAMINO');
    if (!activeRouteOrder || !navigator.geolocation) return;

    const emitLocation = (pos: GeolocationPosition) => {
      trackingService.enviarUbicacion({
        pedidoId: activeRouteOrder.id,
        latitud: pos.coords.latitude,
        longitud: pos.coords.longitude,
        precision: pos.coords.accuracy,
        rumbo: pos.coords.heading || undefined,
        velocidad: pos.coords.speed || undefined,
      }).catch(() => {});
    };

    navigator.geolocation.getCurrentPosition(emitLocation, () => {}, { enableHighAccuracy: true });

    const watchId = navigator.geolocation.watchPosition(emitLocation, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [myDeliveries]);

  // Handlers para Pedidos de Comercio con Aceptación Atómica
  const handleClaimOrder = async (id: number) => {
    setIsClaiming(id);
    try {
      await pedidoService.claimOrder(id);
      success(`¡Has tomado el domicilio del pedido #${id}!`);
      await loadDeliveryData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Este domicilio ya fue tomado por otro domiciliario.';
      showError(msg);
      await loadDeliveryData();
    } finally {
      setIsClaiming(null);
    }
  };

  const handleTransitOrder = async (id: number) => {
    setIsClaiming(id);
    try {
      await pedidoService.markInTransit(id);
      success(`Pedido #${id} marcado como EN CAMINO`);
      await loadDeliveryData();
    } catch (err) {
      showError('Error al iniciar ruta');
    } finally {
      setIsClaiming(null);
    }
  };

  const handleDeliverOrder = async (id: number) => {
    setIsClaiming(id);
    try {
      await pedidoService.markDelivered(id);
      success(`¡Pedido #${id} entregado con éxito! 🎉`);
      await loadDeliveryData();
    } catch (err) {
      showError('Error al confirmar entrega');
    } finally {
      setIsClaiming(null);
    }
  };

  // Handlers para Encomiendas Urbanas
  const handleClaimEncomienda = async (id: number) => {
    setIsClaiming(id);
    try {
      await encomiendaService.tomarEncomienda(id);
      success(`¡Has tomado la encomienda #ENC-${id}!`);
      await loadDeliveryData();
    } catch (err) {
      showError('No se pudo tomar la encomienda.');
    } finally {
      setIsClaiming(null);
    }
  };

  const handleUpdateEncomiendaStatus = async (
    id: number,
    nuevoEstado: EstadoEncomienda,
    label: string
  ) => {
    setIsClaiming(id);
    try {
      await encomiendaService.actualizarEstado(id, nuevoEstado);
      success(`Encomienda #ENC-${id}: ${label}`);
      await loadDeliveryData();
    } catch (err) {
      showError(`Error al actualizar estado de la encomienda #${id}`);
    } finally {
      setIsClaiming(null);
    }
  };

  const handleOpenOfertaModal = (enc: Encomienda) => {
    setOfertaModalEnc(enc);
    setOfertaValor(enc.costoEnvio || 2000);
    setOfertaMensaje('');
  };

  const handleCloseOfertaModal = () => {
    setOfertaModalEnc(null);
    setOfertaValor('');
    setOfertaMensaje('');
  };

  const handleSendOferta = async () => {
    if (!ofertaModalEnc) return;
    if (!ofertaValor || Number(ofertaValor) <= 0) {
      showError('Ingresa un valor válido para tu contraoferta.');
      return;
    }

    setIsSubmittingOferta(true);
    try {
      await encomiendaService.crearOferta(ofertaModalEnc.id, {
        valor: Number(ofertaValor),
        mensaje: ofertaMensaje.trim() || undefined,
      });
      success(`¡Contraoferta enviada para la encomienda #ENC-${ofertaModalEnc.id}!`);
      handleCloseOfertaModal();
      await loadDeliveryData();
    } catch (err) {
      const parsed = parseApiError(err);
      showError(parsed.message || 'Error al enviar la contraoferta.');
    } finally {
      setIsSubmittingOferta(false);
    }
  };

  const handleCancelarOferta = async (encomiendaId: number, ofertaId: number) => {
    try {
      await encomiendaService.cancelarOferta(encomiendaId, ofertaId);
      success('Contraoferta retirada.');
      await loadDeliveryData();
    } catch (err) {
      const parsed = parseApiError(err);
      showError(parsed.message || 'Error al retirar la contraoferta.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const activeDeliveriesCount = myDeliveries.filter((o) => o.estado !== 'ENTREGADO').length;
  const activeEncomiendasCount = myEncomiendas.filter((e) => e.estado !== 'ENTREGADA' && e.estado !== 'CANCELADA').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Banner de alerta de nuevo domicilio disponible */}
      {newDeliveryAlert && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-emerald-400 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  ¡NUEVO DOMICILIO DISPONIBLE!
                </span>
                <span className="font-extrabold text-sm">Pedido #{newDeliveryAlert.id}</span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                De: <strong className="text-white">{newDeliveryAlert.comercioNombre || newDeliveryAlert.sucursalNombre || 'Comercio Aliado'}</strong> | Para:{' '}
                <strong className="text-white">{newDeliveryAlert.destinoDireccion || newDeliveryAlert.direccionTexto || 'Dirección Cliente'}</strong> | Ganancia:{' '}
                <strong className="text-white">{formatCurrency(newDeliveryAlert.gananciaDomiciliario || newDeliveryAlert.costoEnvio)}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                handleClaimOrder(newDeliveryAlert.id);
                setNewDeliveryAlert(null);
              }}
              disabled={isClaiming === newDeliveryAlert.id}
            >
              Tomar Domicilio
            </Button>
            <button
              onClick={() => setNewDeliveryAlert(null)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-bold"
              aria-label="Cerrar alerta"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Bike className="w-6 h-6 text-amber-500" /> Panel del Domiciliario
          </h1>
          <p className="text-xs text-gray-500">Toma pedidos y encomiendas para ganar dinero por cada servicio entregado</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              localStorage.setItem('fastgo_delivery_sound_enabled', String(next));
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
            }`}
            title={soundEnabled ? 'Alertas sonoras activadas' : 'Alertas sonoras silenciadas'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            <span>{soundEnabled ? 'Sonido ON' : 'Silencio'}</span>
          </button>

          {/* Selector de Pestaña Pedidos vs Encomiendas */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'pedidos'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              Pedidos Comercio ({availableOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('encomiendas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'encomiendas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4 text-blue-600" />
              Encomiendas ({availableEncomiendas.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'pedidos' ? (
        /* SECCIÓN PEDIDOS DE COMERCIO */
        <div className="space-y-8">
          {/* Mis Entregas Activas */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              🛵 Mis Entregas de Comercio en Curso ({activeDeliveriesCount})
            </h2>

            {activeDeliveriesCount === 0 ? (
              <Card className="text-center py-8 bg-amber-50/50 border-dashed border-amber-200">
                <p className="text-xs font-bold text-amber-800">No tienes pedidos de comercio activos en este momento.</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Toma un pedido de la lista de disponibles abajo.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {myDeliveries
                  .filter((o) => o.estado !== 'ENTREGADO')
                  .map((order) => {
                    const meta = ORDER_STATUS_DETAILS[order.estado];
                    return (
                      <Card key={order.id} className="p-5 border-l-4 border-l-emerald-500 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-base text-gray-900">Pedido #{order.id}</span>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                                {meta.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Fecha: {formatDate(order.creadoEn)}</p>
                            <p className="text-xs font-black text-gray-900 mt-0.5">Total a cobrar: {formatCurrency(order.total)}</p>
                          </div>

                          {/* Botones de acción del Domiciliario */}
                          <div className="flex items-center gap-2">
                            {(order.estado === 'LISTO_PARA_ENTREGA' || order.estado === 'LISTO') && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleTransitOrder(order.id)}
                                isLoading={isClaiming === order.id}
                                icon={<Navigation className="w-4 h-4" />}
                              >
                                Iniciar Ruta (En Camino)
                              </Button>
                            )}

                            {order.estado === 'EN_CAMINO' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDeliverOrder(order.id)}
                                isLoading={isClaiming === order.id}
                                icon={<Check className="w-4 h-4" />}
                              >
                                Marcar Entregado
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                          <div>
                            <span className="font-bold text-purple-700 block text-[10px] uppercase flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> Recoger en (Comercio):
                            </span>
                            <span className="font-extrabold text-gray-900">{order.comercioNombre || 'Comercio FastGo'}</span>
                            <p className="text-[11px] text-gray-600">{order.comercioDireccion || 'Dirección de la sede'}</p>
                            {order.origenTelefono && (
                              <p className="text-[10px] text-purple-700 font-bold mt-0.5">📞 Tel: {order.origenTelefono}</p>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-emerald-700 block text-[10px] uppercase flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Entregar a (Cliente):
                            </span>
                            <span className="font-extrabold text-gray-900">
                              {order.clienteNombre || 'Cliente'} {order.clienteTelefono && <span className="text-emerald-700 font-bold">({order.clienteTelefono})</span>}
                            </span>
                            <p className="text-[11px] text-gray-600">
                              {order.destinoDireccion || order.direccionTexto || 'Dirección de entrega'}
                              {order.destinoCiudad && ` (${order.destinoCiudad})`}
                            </p>
                            {order.destinoReferencia && (
                              <p className="text-[10px] text-gray-500 italic mt-0.5">Ref: {order.destinoReferencia}</p>
                            )}
                            {order.destinoLatitud != null && order.destinoLongitud != null && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${order.destinoLatitud},${order.destinoLongitud}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 mt-1"
                              >
                                📍 Navegar en Google Maps ({order.destinoLatitud.toFixed(4)}, {order.destinoLongitud.toFixed(4)})
                              </a>
                            )}
                          </div>
                          <div className="sm:col-span-2 pt-1 border-t border-gray-200/50 flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">Ganancia domicilio: <strong className="text-emerald-700">{formatCurrency(order.gananciaDomiciliario ?? order.costoEnvio)}</strong></span>
                            <span className="text-gray-500">Cobro total: <strong className="text-gray-900">{formatCurrency(order.total)}</strong> ({order.metodoPago || 'EFECTIVO'})</span>
                          </div>
                        </div>

                        {order.observaciones && (
                          <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
                            <span className="font-bold">Observaciones:</span> {order.observaciones}
                          </div>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </section>

          {/* Pedidos Disponibles para Tomar */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              📦 Pedidos de Comercio Disponibles ({availableOrders.length})
            </h2>

            {availableOrders.length === 0 ? (
              <Card className="text-center py-10">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700 text-sm">No hay pedidos de comercio listos en este momento</p>
                <p className="text-xs text-gray-400 mt-0.5">Los nuevos pedidos listos para entrega aparecerán aquí automáticamente.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <Card key={order.id} className="p-5 space-y-4 hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-gray-900">Pedido #{order.id}</span>
                        <Badge variant="warning">Listo en Cocina / Mostrador</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{formatDate(order.creadoEn)}</span>
                      </div>
                    </div>

                    {/* Origen vs Destino vs Ganancia */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                      {/* Origen */}
                      <div className="space-y-1">
                        <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" /> Origen (Recogida)
                        </p>
                        <p className="font-extrabold text-gray-900 text-sm">{order.comercioNombre || 'Comercio FastGo'}</p>
                        <p className="text-gray-600 text-[11px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          {order.comercioDireccion || 'Dirección de sede comercial'}
                        </p>
                      </div>

                      {/* Destino */}
                      <div className="space-y-1">
                        <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destino (Cliente)
                        </p>
                        <p className="font-extrabold text-gray-900 text-sm">{order.clienteNombre || 'Cliente'}</p>
                        <p className="text-gray-600 text-[11px]">
                          {order.destinoDireccion || order.direccionTexto || 'Dirección de entrega asignada'}
                          {order.destinoCiudad && ` (${order.destinoCiudad})`}
                        </p>
                        {order.destinoReferencia && (
                          <p className="text-[10px] text-gray-500 italic">Ref: {order.destinoReferencia}</p>
                        )}
                        {order.destinoLatitud != null && order.destinoLongitud != null && (
                          <span className="text-[10px] text-blue-600 font-semibold block">
                            GPS: {order.destinoLatitud.toFixed(4)}, {order.destinoLongitud.toFixed(4)}
                          </span>
                        )}
                      </div>

                      {/* Ganancia del Domiciliario */}
                      <div className="space-y-1 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                        <p className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Ganancia por Domicilio
                        </p>
                        <p className="font-black text-emerald-700 text-lg">
                          {formatCurrency(order.gananciaDomiciliario ?? order.costoEnvio)}
                        </p>
                        <p className="text-[10px] text-emerald-600">Tarifa fija congelada en el pedido</p>
                      </div>
                    </div>

                    {order.observaciones && (
                      <div className="p-2.5 rounded-xl bg-amber-50 text-xs text-amber-900 border border-amber-200">
                        <span className="font-bold">Observaciones: </span> {order.observaciones}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Cobro total: <strong className="text-gray-800">{formatCurrency(order.total)}</strong> ({order.metodoPago || 'EFECTIVO'})
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleClaimOrder(order.id)}
                        isLoading={isClaiming === order.id}
                        icon={<Bike className="w-4 h-4" />}
                        className="bg-emerald-600 hover:bg-emerald-700 font-black tracking-wider uppercase"
                      >
                        ACEPTAR DOMICILIO
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* SECCIÓN ENCOMIENDAS URBANAS */
        <div className="space-y-8">
          {/* Mis Encomiendas Asignadas */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              📦 Mis Encomiendas Asignadas ({activeEncomiendasCount})
            </h2>

            {activeEncomiendasCount === 0 ? (
              <Card className="text-center py-8 bg-blue-50/50 border-dashed border-blue-200">
                <p className="text-xs font-bold text-blue-900">No tienes encomiendas asignadas en este momento.</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Toma una encomienda de la lista de disponibles abajo para realizar el servicio.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myEncomiendas
                  .filter((e) => e.estado !== 'ENTREGADA' && e.estado !== 'CANCELADA')
                  .map((enc) => (
                    <Card key={enc.id} className="p-5 border-l-4 border-l-blue-600 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-gray-900">Encomienda #ENC-{enc.id}</span>
                            <Badge variant="info">{enc.estado}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Paquete: <strong className="text-gray-800">{enc.descripcion}</strong> ({enc.tamanoPeso || 'Estándar'})</p>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Ganancia Servicio</span>
                          <span className="text-lg font-black text-emerald-600">
                            {formatCurrency(enc.costoEnvio || 2000)}
                          </span>
                        </div>
                      </div>

                      {/* Rutas Origen / Destino */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">1. Recoger en:</span>
                          <p className="font-bold text-gray-900 mt-0.5">{enc.direccionOrigen}</p>
                          <p className="text-gray-600 text-[11px]">{enc.remitenteNombre} ({enc.remitenteTelefono})</p>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">2. Entregar en:</span>
                          <p className="font-bold text-gray-900 mt-0.5">{enc.direccionDestino}</p>
                          <p className="text-gray-600 text-[11px]">{enc.destinatarioNombre} ({enc.destinatarioTelefono})</p>
                        </div>
                      </div>

                      {/* Botones de Progresión del Ciclo de Vida: ACEPTADA -> EN_RECOGIDA -> EN_CAMINO -> ENTREGADA */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        {enc.estado === 'ACEPTADA' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateEncomiendaStatus(enc.id, 'EN_RECOGIDA', 'En camino a recoger paquete')}
                            isLoading={isClaiming === enc.id}
                            icon={<Navigation className="w-4 h-4" />}
                          >
                            Ir a Recoger Paquete
                          </Button>
                        )}

                        {enc.estado === 'EN_RECOGIDA' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateEncomiendaStatus(enc.id, 'EN_CAMINO', 'Paquete recogido, en camino al destino')}
                            isLoading={isClaiming === enc.id}
                            icon={<Bike className="w-4 h-4" />}
                          >
                            Paquete Recogido (En Ruta)
                          </Button>
                        )}

                        {enc.estado === 'EN_CAMINO' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateEncomiendaStatus(enc.id, 'ENTREGADA', 'Encomienda entregada con éxito')}
                            isLoading={isClaiming === enc.id}
                            icon={<Check className="w-4 h-4" />}
                          >
                            Confirmar Entrega al Destinatario
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </section>

          {/* Encomiendas Disponibles */}
          <section className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              📋 Encomiendas Urbanas Disponibles ({availableEncomiendas.length})
            </h2>

            {availableEncomiendas.length === 0 ? (
              <Card className="text-center py-10">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-700 text-sm">No hay encomiendas pendientes en este momento</p>
                <p className="text-xs text-gray-400 mt-0.5">Nuevas solicitudes de usuarios aparecerán en tiempo real.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableEncomiendas.map((enc) => {
                  const myOffer = mySentOffers.find(
                    (o) => o.encomiendaId === enc.id && o.estado === 'PENDIENTE'
                  );
                  const numOfertas = enc.numeroOfertas || 0;

                  return (
                    <Card key={enc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-emerald-500">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-base text-gray-900">#ENC-{enc.id}</span>
                          <Badge variant="warning">{enc.estado === 'OFERTA' ? 'En Negociación' : 'Disponible'}</Badge>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            Tarifa Cliente: {formatCurrency(enc.costoEnvio || 2000)}
                          </span>
                          {numOfertas > 0 && (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              {numOfertas} {numOfertas === 1 ? 'oferta' : 'ofertas'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-700">
                          <strong>Origen:</strong> {enc.direccionOrigen} → <strong>Destino:</strong> {enc.direccionDestino}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Detalle: {enc.descripcion} ({enc.tamanoPeso || 'Estándar'})
                        </p>

                        {myOffer && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between mt-1">
                            <span>
                              Has enviado contraoferta por <strong>{formatCurrency(myOffer.valor)}</strong> (Esperando respuesta)
                            </span>
                            <button
                              onClick={() => handleCancelarOferta(enc.id, myOffer.id)}
                              className="text-rose-600 hover:text-rose-800 text-[11px] font-bold underline ml-2"
                            >
                              Retirar
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {!myOffer && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenOfertaModal(enc)}
                            icon={<MessageSquare className="w-4 h-4 text-amber-600" />}
                            className="text-xs font-bold border-amber-300 text-amber-900 hover:bg-amber-50"
                          >
                            Contraofertar
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleClaimEncomienda(enc.id)}
                          isLoading={isClaiming === enc.id}
                          icon={<Package className="w-4 h-4" />}
                          className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs"
                        >
                          Aceptar Tarifa
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mis Ofertas Enviadas */}
          {mySentOffers.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                📨 Mis Ofertas Enviadas ({mySentOffers.length})
              </h2>
              <div className="space-y-2.5">
                {mySentOffers.map((of) => (
                  <Card key={of.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Encomienda #ENC-{of.encomiendaId}</span>
                        <Badge
                          variant={
                            of.estado === 'ACEPTADA'
                              ? 'success'
                              : of.estado === 'RECHAZADA'
                              ? 'danger'
                              : of.estado === 'CANCELADA'
                              ? 'secondary'
                              : 'warning'
                          }
                        >
                          {of.estado}
                        </Badge>
                      </div>
                      {of.mensaje && <p className="text-[11px] text-gray-600 italic mt-0.5">"{of.mensaje}"</p>}
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{formatDate(of.creadoEn)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase block">Tu oferta</span>
                        <span className="text-base font-black text-emerald-700">{formatCurrency(of.valor)}</span>
                      </div>
                      {of.estado === 'PENDIENTE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs px-2.5 py-1"
                          onClick={() => handleCancelarOferta(of.encomiendaId, of.id)}
                        >
                          Retirar
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal de Contraoferta */}
      {ofertaModalEnc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">Enviar Contraoferta</h3>
                  <p className="text-xs text-gray-500">Encomienda #ENC-{ofertaModalEnc.id}</p>
                </div>
              </div>
              <button
                onClick={handleCloseOfertaModal}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 text-xs space-y-1">
              <p className="text-gray-600">
                <strong>Ruta:</strong> {ofertaModalEnc.direccionOrigen} → {ofertaModalEnc.direccionDestino}
              </p>
              <p className="text-gray-600">
                <strong>Tarifa inicial ofrecida:</strong> {formatCurrency(ofertaModalEnc.costoEnvio || 2000)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tu Tarifa Propuesta (COP)
                </label>
                <input
                  type="number"
                  step={500}
                  min={1000}
                  value={ofertaValor}
                  onChange={(e) => setOfertaValor(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej. 10000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mensaje para el Cliente (Opcional)
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={ofertaMensaje}
                  onChange={(e) => setOfertaMensaje(e.target.value)}
                  placeholder="Ej. Llego en 3 min, voy en moto con baúl seguro"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" onClick={handleCloseOfertaModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                isLoading={isSubmittingOferta}
                onClick={handleSendOferta}
              >
                Enviar Contraoferta
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

