import React, { useEffect, useState } from 'react';
import { Bike, Package, Check, ArrowRight, Navigation, MapPin, Layers, Clock, Send, ShieldCheck } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import { encomiendaService } from '../../services/encomiendaService';
import { Pedido, Encomienda, EstadoEncomienda } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS } from '../../constants/orderStatus';

export const DeliveryDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'encomiendas'>('pedidos');
  const [availableOrders, setAvailableOrders] = useState<Pedido[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Pedido[]>([]);

  const [availableEncomiendas, setAvailableEncomiendas] = useState<Encomienda[]>([]);
  const [myEncomiendas, setMyEncomiendas] = useState<Encomienda[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);

  const { success, error: showError } = useToast();

  const loadDeliveryData = async () => {
    try {
      const [available, myOrds, availEnc, myEnc] = await Promise.all([
        pedidoService.listAvailableForDelivery().catch(() => []),
        pedidoService.listMyDeliveries().catch(() => []),
        encomiendaService.listarDisponibles().catch(() => []),
        encomiendaService.listarAsignadas().catch(() => []),
      ]);
      setAvailableOrders(available);
      setMyDeliveries(myOrds);
      setAvailableEncomiendas(availEnc);
      setMyEncomiendas(myEnc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryData();
  }, []);

  // Handlers para Pedidos de Comercio
  const handleClaimOrder = async (id: number) => {
    setIsClaiming(id);
    try {
      await pedidoService.claimOrder(id);
      success(`¡Has tomado el pedido #${id}!`);
      await loadDeliveryData();
    } catch (err) {
      showError('No fue posible tomar el pedido. Puede que ya haya sido tomado.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Bike className="w-6 h-6 text-amber-500" /> Panel del Domiciliario
          </h1>
          <p className="text-xs text-gray-500">Toma pedidos y encomiendas para ganar dinero por cada servicio entregado</p>
        </div>

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

                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="font-bold text-gray-700">Ruta de Entrega:</span> Destino asignado para el pedido #{order.id}.
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
              <div className="space-y-3">
                {availableOrders.map((order) => (
                  <Card key={order.id} className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-gray-900">Pedido #{order.id}</span>
                        <Badge variant="warning">Listo para entrega</Badge>
                      </div>
                      <p className="text-xs text-gray-500">Hora: {formatDate(order.creadoEn)}</p>
                      <p className="text-xs font-black text-gray-900">Total: {formatCurrency(order.total)}</p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaimOrder(order.id)}
                      isLoading={isClaiming === order.id}
                      icon={<Bike className="w-4 h-4" />}
                    >
                      Tomar Pedido
                    </Button>
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
                {availableEncomiendas.map((enc) => (
                  <Card key={enc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-gray-900">#ENC-{enc.id}</span>
                        <Badge variant="warning">Disponible</Badge>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          Tarifa: {formatCurrency(enc.costoEnvio || 2000)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">
                        <strong>Origen:</strong> {enc.direccionOrigen} → <strong>Destino:</strong> {enc.direccionDestino}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Detalle: {enc.descripcion} ({enc.tamanoPeso || 'Estándar'})
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaimEncomienda(enc.id)}
                      isLoading={isClaiming === enc.id}
                      icon={<Package className="w-4 h-4" />}
                    >
                      Tomar Encomienda
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
