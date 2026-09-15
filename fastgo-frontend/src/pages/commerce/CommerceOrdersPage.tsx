import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Clock, PackageCheck, AlertCircle } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { pedidoService } from '../../services/pedidoService';
import { Pedido, Sucursal } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS } from '../../constants/orderStatus';
import { APP_ROUTES } from '../../constants/routes';

export const CommerceOrdersPage: React.FC = () => {
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const { success, error: showError } = useToast();

  const loadData = async () => {
    try {
      const commerces = await commerceService.listCommerces();
      if (commerces.length > 0) {
        const sucs = await sucursalService.listByCommerce(commerces[0].id);
        setBranches(sucs);
        if (sucs.length > 0) {
          const branchId = selectedBranchId || sucs[0].id;
          setSelectedBranchId(branchId);
          const ords = await pedidoService.listBySucursal(branchId);
          setOrders(ords);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  // Transiciones de estado del comercio
  const handleConfirm = async (id: number) => {
    setIsUpdating(id);
    try {
      await pedidoService.confirmOrder(id);
      success(`Pedido #${id} confirmado`);
      await loadData();
    } catch (err) {
      showError('No se pudo confirmar el pedido');
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePrepare = async (id: number) => {
    setIsUpdating(id);
    try {
      await pedidoService.prepareOrder(id);
      success(`Pedido #${id} en preparación`);
      await loadData();
    } catch (err) {
      showError('No se pudo cambiar a preparación');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReady = async (id: number) => {
    setIsUpdating(id);
    try {
      await pedidoService.markReady(id);
      success(`Pedido #${id} marcado como listo para recogida`);
      await loadData();
    } catch (err) {
      showError('No se pudo marcar como listo');
    } finally {
      setIsUpdating(null);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={APP_ROUTES.COMMERCE_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de comercio
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pedidos de la Sucursal</h1>
          <p className="text-xs text-gray-500">Administra la preparación y despacho</p>
        </div>

        {branches.length > 0 && (
          <select
            value={selectedBranchId || ''}
            onChange={(e) => setSelectedBranchId(Number(e.target.value))}
            className="bg-white border border-gray-200 text-xs font-bold rounded-xl px-3 py-2"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 {b.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-700">No hay pedidos registrados en esta sucursal</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const meta = ORDER_STATUS_DETAILS[order.estado] || {
              label: order.estado,
              badgeClass: 'bg-gray-100 text-gray-700',
            };

            return (
              <Card key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-gray-900">Pedido #{order.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(order.creadoEn)}</p>
                  <p className="text-xs font-extrabold text-gray-900">
                    Total: {formatCurrency(order.total)}
                  </p>
                  {order.observaciones && (
                    <p className="text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded-lg">
                      Nota: {order.observaciones}
                    </p>
                  )}
                </div>

                {/* Acciones autorizadas por estado */}
                <div className="flex items-center gap-2">
                  {order.estado === 'PENDIENTE' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConfirm(order.id)}
                      isLoading={isUpdating === order.id}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Confirmar Pedido
                    </Button>
                  )}

                  {order.estado === 'CONFIRMADO' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePrepare(order.id)}
                      isLoading={isUpdating === order.id}
                      icon={<Clock className="w-4 h-4" />}
                    >
                      Iniciar Preparación
                    </Button>
                  )}

                  {(order.estado === 'EN_PREPARACION' || order.estado === 'PREPARANDO') && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReady(order.id)}
                      isLoading={isUpdating === order.id}
                      icon={<PackageCheck className="w-4 h-4" />}
                    >
                      Marcar Listo para Entrega
                    </Button>
                  )}

                  {(order.estado === 'LISTO_PARA_ENTREGA' || order.estado === 'LISTO' || order.estado === 'EN_CAMINO' || order.estado === 'ENTREGADO') && (
                    <span className="text-xs text-gray-500 font-medium italic">
                      En manos de domiciliario
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
