import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Clock, PackageCheck, AlertCircle, XCircle, ChevronDown, ChevronUp, Package, MapPin, User, Phone, CreditCard } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { pedidoService } from '../../services/pedidoService';
import { DetallePedido, Pedido, Sucursal } from '../../types';
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
  const [expandedOrders, setExpandedOrders] = useState<Record<number, DetallePedido[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});

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

  const toggleOrderDetails = async (orderId: number) => {
    if (expandedOrders[orderId]) {
      const next = { ...expandedOrders };
      delete next[orderId];
      setExpandedOrders(next);
      return;
    }

    setLoadingDetails((prev) => ({ ...prev, [orderId]: true }));
    try {
      const items = await pedidoService.getOrderDetails(orderId);
      setExpandedOrders((prev) => ({ ...prev, [orderId]: items }));
    } catch (err) {
      showError('No se pudieron cargar los productos a empacar');
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [orderId]: false }));
    }
  };

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

  const handleReject = async (id: number) => {
    const motivo = window.prompt('Indica el motivo del rechazo del pedido (ej: Agotado, Cocina saturada):');
    if (motivo === null) return;
    setIsUpdating(id);
    try {
      await pedidoService.rechazarOrder(id, motivo || 'Cancelado por el comercio');
      success(`Pedido #${id} rechazado`);
      await loadData();
    } catch (err) {
      showError('No se pudo rechazar el pedido');
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
          <h1 className="text-2xl font-black text-gray-900">Cocina y Despacho de Pedidos</h1>
          <p className="text-xs text-gray-500">Revisa clientes, direcciones, productos a empacar y despacha a repartidores</p>
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
            const items = expandedOrders[order.id];
            const isDetailsOpen = !!items;
            const isLoadingItems = loadingDetails[order.id];

            return (
              <Card key={order.id} className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-gray-900">Pedido #{order.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(order.creadoEn)}</p>
                </div>

                {/* Cliente, Entrega y Pago */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-600" /> Cliente
                    </p>
                    <p className="font-extrabold text-gray-900">{order.clienteNombre || 'Cliente FastGo'}</p>
                    {order.clienteTelefono && (
                      <p className="text-gray-600 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-gray-400" /> {order.clienteTelefono}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-600" /> Dirección de Entrega
                    </p>
                    <p className="font-semibold text-gray-800">{order.direccionTexto || 'Dirección registrada'}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-600" /> Pago y Totales
                    </p>
                    <p className="font-bold text-emerald-700">Método: {order.metodoPago || 'EFECTIVO'}</p>
                    <div className="text-[11px] text-gray-600 space-y-0.5">
                      <div>Subtotal: {formatCurrency(order.subtotal)}</div>
                      <div>Domicilio: {formatCurrency(order.costoEnvio)}</div>
                      <div className="font-black text-gray-900 text-xs">Total: {formatCurrency(order.total)}</div>
                    </div>
                  </div>
                </div>

                {order.observaciones && (
                  <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span className="font-bold">Observaciones del cliente: </span>
                    {order.observaciones}
                  </div>
                )}

                {/* Botón para expandir productos a empacar */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleOrderDetails(order.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    {isDetailsOpen ? 'Ocultar productos a empacar' : 'Ver productos a empacar'}
                    {isLoadingItems ? (
                      <Spinner size="sm" className="ml-1" />
                    ) : isDetailsOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                    )}
                  </button>

                  {isDetailsOpen && (
                    <div className="mt-2.5 bg-white border border-gray-200 rounded-xl p-3 shadow-xs space-y-2">
                      <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                        Lista de Preparación / Empaque
                      </p>
                      {items.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No se encontraron productos registrados en este pedido.</p>
                      ) : (
                        <div className="divide-y divide-gray-100 text-xs">
                          {items.map((it) => (
                            <div key={it.id} className="py-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-black bg-gray-900 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]">
                                  {it.cantidad}
                                </span>
                                <span className="font-bold text-gray-800">
                                  {it.productoNombre || `Producto #${it.productoId}`}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-500 text-[11px]">
                                  {it.cantidad} × {formatCurrency(it.precio)} =
                                </span>{' '}
                                <span className="font-black text-gray-900">
                                  {formatCurrency(it.subtotal)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones autorizadas por estado */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  {order.estado === 'PENDIENTE' && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(order.id)}
                        isLoading={isUpdating === order.id}
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        Rechazar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleConfirm(order.id)}
                        isLoading={isUpdating === order.id}
                        icon={<Check className="w-4 h-4" />}
                      >
                        Confirmar Pedido
                      </Button>
                    </>
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

                  {(order.estado === 'LISTO_PARA_ENTREGA' || order.estado === 'LISTO') && (
                    <span className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Listo en mostrador — Esperando que un repartidor lo tome
                    </span>
                  )}

                  {order.estado === 'EN_CAMINO' && (
                    <span className="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5" /> En camino con el repartidor asignado
                    </span>
                  )}

                  {order.estado === 'ENTREGADO' && (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Pedido entregado exitosamente al cliente
                    </span>
                  )}

                  {order.estado === 'CANCELADO' && (
                    <span className="text-xs text-rose-700 font-bold bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Pedido cancelado
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

