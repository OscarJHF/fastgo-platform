import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, MapPin, ShieldAlert, Bike, CreditCard, FileText, Eye, Download, Navigation } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import { pagoService } from '../../services/pagoService';
import { uploadService } from '../../services/uploadService';
import { trackingService } from '../../services/trackingService';
import { DetallePedido, OrderStatus, Pago, Pedido, TrackingResponse } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
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
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Visor de comprobante privado
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [isPdfReceipt, setIsPdfReceipt] = useState(false);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

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

  // Polling de telemetría de seguimiento en tiempo real cuando el pedido está EN_CAMINO
  useEffect(() => {
    if (order?.estado !== 'EN_CAMINO') return;

    const fetchTracking = async () => {
      const data = await trackingService.obtenerUltimaUbicacion(orderId);
      if (data) setTracking(data);
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [order?.estado, orderId]);

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

  const handleOpenReceipt = async () => {
    if (!order?.comprobantePagoUrl) return;
    setIsReceiptModalOpen(true);
    setIsLoadingReceipt(true);
    try {
      const { blobUrl, isPdf } = await pedidoService.getComprobanteBlob(order.comprobantePagoUrl);
      setReceiptBlobUrl(blobUrl);
      setIsPdfReceipt(isPdf);
    } catch (err) {
      showError('No se pudo cargar el comprobante privado');
      setIsReceiptModalOpen(false);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  const handleCloseReceiptModal = () => {
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
    }
    setReceiptBlobUrl(null);
    setIsReceiptModalOpen(false);
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
            <CreditCard className="w-4 h-4 text-gray-700" /> Información de Pago
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            {order.metodoPago || 'EFECTIVO'}
          </span>
        </div>

        {order.metodoPago === 'BANCOLOMBIA' ? (
          <div className="space-y-3 pt-1">
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              order.estadoPago === 'APROBADO'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : order.estadoPago === 'RECHAZADO'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                {order.estadoPago === 'APROBADO' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : order.estadoPago === 'RECHAZADO' ? (
                  <XCircle className="w-4 h-4 text-rose-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {order.estadoPago === 'APROBADO' && 'Pago verificado y aprobado por el comercio'}
                  {order.estadoPago === 'RECHAZADO' && `Pago rechazado: ${order.motivoRechazoPago || 'Comprobante no válido'}`}
                  {(!order.estadoPago || order.estadoPago === 'PENDIENTE_VERIFICACION') &&
                    'Comprobante adjunto. El comercio está verificando la transferencia en su cuenta.'}
                </span>
              </div>
            </div>

            {order.comprobantePagoUrl && (
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                  <FileText className="w-4 h-4 text-purple-600" /> Comprobante enviado
                </span>
                <button
                  type="button"
                  onClick={handleOpenReceipt}
                  className="font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver Comprobante
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-600">
            {order.metodoPago === 'EFECTIVO'
              ? 'Pago en efectivo directo al domiciliario al momento de recibir la entrega.'
              : 'Pago gestionado según método seleccionado.'}
          </p>
        )}
      </Card>

      {/* Destino y Geolocalización / Tracking GPS */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> Ubicación y Datos de Entrega
          </h3>
          {order.estado === 'EN_CAMINO' && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 animate-pulse flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-600" /> GPS en vivo
            </span>
          )}
        </div>

        <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 space-y-2 text-xs">
          <div>
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">Dirección de Entrega</span>
            <p className="font-extrabold text-gray-900 text-sm">
              {order.destinoDireccion || order.direccionTexto || 'Dirección de entrega asignada'}
              {order.destinoCiudad && <span className="text-gray-600 font-semibold ml-1">({order.destinoCiudad})</span>}
            </p>
          </div>

          {order.destinoReferencia && (
            <p className="text-gray-600 text-[11px] italic bg-white p-2 rounded-lg border border-gray-200">
              <span className="font-bold not-italic text-gray-700">Punto de referencia:</span> {order.destinoReferencia}
            </p>
          )}

          {order.destinoLatitud != null && order.destinoLongitud != null && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-500">
                Coordenadas destino: <strong>{order.destinoLatitud.toFixed(4)}, {order.destinoLongitud.toFixed(4)}</strong>
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${order.destinoLatitud},${order.destinoLongitud}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1"
              >
                Abrir en Google Maps ↗
              </a>
            </div>
          )}
        </div>

        {/* Telemetría GPS en tiempo real cuando el repartidor está en camino */}
        {order.estado === 'EN_CAMINO' && (
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-blue-900 flex items-center gap-1.5 text-xs">
                <Bike className="w-4 h-4 text-blue-600" /> Repartidor en Ruta hacia tu Ubicación
              </span>
              <span className="text-[10px] text-blue-700 font-semibold">Telemetría GPS FastGo</span>
            </div>

            {tracking ? (
              <div className="space-y-2 pt-1 text-[11px] text-blue-800">
                <p>
                  Posición actual: <strong>{tracking.latitud.toFixed(5)}, {tracking.longitud.toFixed(5)}</strong>
                  {tracking.velocidad != null && ` • ${(tracking.velocidad * 3.6).toFixed(0)} km/h`}
                  {tracking.precision != null && ` • Precisión: ±${Math.round(tracking.precision)}m`}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-blue-600">
                    Último reporte: {formatDate(tracking.fechaHora)}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${tracking.latitud},${tracking.longitud}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-[10px]"
                  >
                    Ver Repartidor en Mapa ↗
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-blue-700">
                Repartidor en desplazamiento. Esperando primera transmisión de coordenadas desde el dispositivo...
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Observaciones */}
      {order.observaciones && (
        <Card className="p-4 bg-gray-50 text-xs text-gray-600">
          <span className="font-bold text-gray-900 block mb-1">Instrucciones de entrega:</span>
          {order.observaciones}
        </Card>
      )}

      {/* Modal Visor de Comprobante Privado */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceiptModal}
        title="Comprobante de Pago Privado"
      >
        <div className="space-y-4">
          {isLoadingReceipt ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Spinner size="md" />
              <p className="mt-2 text-xs text-gray-500 font-semibold">Cargando comprobante seguro...</p>
            </div>
          ) : receiptBlobUrl ? (
            <>
              {isPdfReceipt ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">Comprobante en formato PDF</p>
                    <p className="text-xs text-gray-500">Documento bancario privado adjunto a tu pedido.</p>
                  </div>
                  <a
                    href={receiptBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`comprobante-pedido-${order?.id}.pdf`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Abrir / Descargar PDF
                  </a>
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-auto rounded-xl border border-gray-200 bg-gray-900/5 p-2 flex items-center justify-center">
                  <img
                    src={receiptBlobUrl}
                    alt="Comprobante de pago"
                    className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={handleCloseReceiptModal}>
                  Cerrar
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};
