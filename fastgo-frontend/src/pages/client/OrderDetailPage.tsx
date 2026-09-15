import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, MapPin, ShieldAlert, Bike } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import { pagoService } from '../../services/pagoService';
import { DetallePedido, OrderStatus, Pago, Pedido } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS } from '../../constants/orderStatus';
import { APP_ROUTES } from '../../constants/routes';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [order, setOrder] = useState<Pedido | null>(null);
  const [details, setDetails] = useState<DetallePedido[]>([]);
  const [payments, setPayments] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const { success, error: showError } = useToast();

  const loadOrder = async () => {
    try {
      const [orderData, detailsData, paymentsData] = await Promise.all([
        pedidoService.getOrder(orderId),
        pedidoService.getOrderDetails(orderId),
        pagoService.getPaymentsByOrder(orderId).catch(() => []),
      ]);
      setOrder(orderData);
      setDetails(detailsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error cargando pedido:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!window.confirm('¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.')) return;
    setIsCancelling(true);
    try {
      await pedidoService.cancelOrder(orderId);
      success('Pedido cancelado con éxito');
      await loadOrder();
    } catch (err) {
      showError('Solo se pueden cancelar pedidos en estado PENDIENTE');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Consultando estado del pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Pedido no encontrado</h2>
        <Link to={APP_ROUTES.MY_ORDERS} className="mt-4 inline-block">
          <Button variant="primary">Volver a mis pedidos</Button>
        </Link>
      </div>
    );
  }

  const meta = ORDER_STATUS_DETAILS[order.estado] || {
    label: order.estado,
    badgeClass: 'bg-gray-100 text-gray-700',
    description: '',
  };

  // Timeline progression steps
  const steps: OrderStatus[] = [
    'PENDIENTE',
    'CONFIRMADO',
    'EN_PREPARACION',
    'LISTO_PARA_ENTREGA',
    'EN_CAMINO',
    'ENTREGADO',
  ];

  const currentStepIndex = steps.indexOf(order.estado);
  const isCancelled = order.estado === 'CANCELADO';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={APP_ROUTES.MY_ORDERS} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver a mis pedidos
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">Pedido #{order.id}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${meta.badgeClass}`}>
              {meta.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{formatDate(order.creadoEn)}</p>
        </div>

        {/* Botón de Cancelación (permitido únicamente en PENDIENTE por contrato backend) */}
        {order.estado === 'PENDIENTE' && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleCancelOrder}
            isLoading={isCancelling}
          >
            Cancelar Pedido
          </Button>
        )}
      </div>

      {/* Stepper Timeline */}
      <Card className="p-6">
        <h3 className="font-extrabold text-sm text-gray-900 mb-4">Seguimiento en Tiempo Real</h3>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-bold">
            <XCircle className="w-5 h-5 text-rose-600" />
            Este pedido ha sido cancelado.
          </div>
        ) : (
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full z-0"></div>
            {steps.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                        : isCompleted
                        ? 'bg-emerald-700 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 text-center max-w-[65px] ${
                    isCurrent ? 'text-black' : 'text-gray-400'
                  }`}>
                    {ORDER_STATUS_DETAILS[step]?.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-6">
          ℹ️ {meta.description}
        </p>
      </Card>

      {/* Productos del Pedido */}
      <Card className="p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900">Productos Ordenados ({details.length})</h3>
        <div className="divide-y divide-gray-100">
          {details.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-gray-100 font-bold text-xs flex items-center justify-center text-gray-700">
                  {item.cantidad}x
                </span>
                <div>
                  <p className="font-bold text-gray-900">Producto #{item.productoId}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.precio)} c/u</p>
                </div>
              </div>
              <span className="font-black text-gray-900">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Costo de Envío</span>
            <span className="font-medium text-emerald-600">{formatCurrency(order.costoEnvio)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-gray-950 pt-2 border-t border-gray-100">
            <span>Total del Pedido</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </Card>

      {/* Estado del Pago & Pasarela */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-gray-700" /> Información de Pago
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Modo Seguro / Demostración
          </span>
        </div>
        <p className="text-xs text-gray-600">
          La pasarela Wompi está deshabilitada en este entorno (<code className="font-mono bg-gray-100 px-1 rounded">fastgo.wompi.enabled=false</code>). No se debitaron fondos reales ni se generaron cargos bancarios falsos.
        </p>
      </Card>

      {/* Destino y Geolocalización (Maps Fallback) */}
      <Card className="p-5 space-y-3">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-700" /> Ubicación y Entrega
        </h3>
        <p className="text-xs text-gray-600">
          Dirección asignada al pedido #{order.id} con coordenadas verificadas.
        </p>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500">
          🗺️ <strong>Modo mapa:</strong> Sin clave pública de Google Maps configurada (<code className="font-mono bg-gray-200 px-1 rounded">fastgo.maps.enabled=false</code>). Se visualiza ubicación estática por dirección sin errores de script.
        </div>
      </Card>

      {/* Observaciones */}
      {order.observaciones && (
        <Card className="p-4 bg-gray-50 text-xs text-gray-600">
          <span className="font-bold text-gray-900 block mb-1">Instrucciones de entrega:</span>
          {order.observaciones}
        </Card>
      )}
    </div>
  );
};
