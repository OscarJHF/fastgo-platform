import React, { useEffect, useState } from 'react';
import { Bike, Package, Check, ArrowRight, Navigation, MapPin } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import { mapsService } from '../../services/mapsService';
import { Pedido } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS } from '../../constants/orderStatus';

export const DeliveryDashboardPage: React.FC = () => {
  const [availableOrders, setAvailableOrders] = useState<Pedido[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);

  const { success, error: showError } = useToast();

  const loadDeliveryData = async () => {
    try {
      const [available, myOrds] = await Promise.all([
        pedidoService.listAvailableForDelivery().catch(() => []),
        pedidoService.listMyDeliveries().catch(() => []),
      ]);
      setAvailableOrders(available);
      setMyDeliveries(myOrds);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryData();
  }, []);

  const handleClaim = async (id: number) => {
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

  const handleTransit = async (id: number) => {
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

  const handleDeliver = async (id: number) => {
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

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Bike className="w-6 h-6 text-amber-500" /> Panel del Domiciliario
        </h1>
        <p className="text-xs text-gray-500">Toma pedidos listos y gestiona tus entregas en tiempo real</p>
      </div>

      {/* Mis Entregas Activas */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          🛵 Mis Entregas en Curso ({myDeliveries.filter((o) => o.estado !== 'ENTREGADO').length})
        </h2>

        {myDeliveries.filter((o) => o.estado !== 'ENTREGADO').length === 0 ? (
          <Card className="text-center py-8 bg-amber-50/50 border-dashed border-amber-200">
            <p className="text-xs font-bold text-amber-800">No tienes pedidos activos en este momento.</p>
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
                            onClick={() => handleTransit(order.id)}
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
                            onClick={() => handleDeliver(order.id)}
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
                        <span className="block text-[10px] text-gray-400 mt-0.5">Modo mapa: Sin API key externa (<code className="font-mono">fastgo.maps.enabled=false</code>). Ubicación gestionada en modo seguro.</span>
                      </div>
                    </div>

                    {order.observaciones && (
                      <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
                        <span className="font-bold">Observaciones de Entrega:</span> {order.observaciones}
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
          📦 Pedidos Disponibles para Entrega ({availableOrders.length})
        </h2>

        {availableOrders.length === 0 ? (
          <Card className="text-center py-10">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-700 text-sm">No hay pedidos listos en este momento</p>
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
                  onClick={() => handleClaim(order.id)}
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
  );
};
