import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ArrowLeft, CheckCircle, AlertCircle, Plus, Copy, FileText, Upload, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { direccionService } from '../../services/direccionService';
import { pedidoService } from '../../services/pedidoService';
import { sucursalService } from '../../services/sucursalService';
import { commerceService } from '../../services/commerceService';
import { wompiService } from '../../services/wompiService';
import { uploadService } from '../../services/uploadService';
import { Direccion, WompiBank } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { parseApiError } from '../../utils/errorHandler';
import { APP_ROUTES } from '../../constants/routes';

export const CheckoutPage: React.FC = () => {
  const { cart, items, subtotal, clearCart, isLoading: isCartLoading } = useCart();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Direccion[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('EFECTIVO');
  const [acceptedMethods, setAcceptedMethods] = useState<string[]>(['EFECTIVO']);
  const [storeCommerce, setStoreCommerce] = useState<any>(null);
  const [storeSucursal, setStoreSucursal] = useState<any>(null);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [nequiPhone, setNequiPhone] = useState(user?.telefono || '');
  const [banks, setBanks] = useState<WompiBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Comprobante Bancolombia
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [comprobanteName, setComprobanteName] = useState<string>('');
  const [isUploadingComprobante, setIsUploadingComprobante] = useState<boolean>(false);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const addressList = await direccionService.listMyAddresses();
        setAddresses(addressList);
        if (addressList.length > 0) {
          const principal = addressList.find((a) => a.principal) || addressList[0];
          setSelectedAddressId(principal.id);
        }

        // Obtener datos del comercio para validar horario y medios de pago
        if (cart?.sucursalId) {
          try {
            const sucursal = await sucursalService.getSucursal(cart.sucursalId);
            setStoreSucursal(sucursal);
            if (sucursal?.comercioId) {
              const comercio = await commerceService.getCommerce(sucursal.comercioId);
              setStoreCommerce(comercio);
              setIsStoreOpen(comercio.abierto !== false && !comercio.pausaManual);

              let methods: string[] = ['EFECTIVO'];
              if (comercio.metodosPago) {
                methods = comercio.metodosPago.split(',').map((m: string) => m.trim().toUpperCase());
              }
              if (comercio.bancolombiaActivo && !methods.includes('BANCOLOMBIA')) {
                methods.push('BANCOLOMBIA');
              }
              setAcceptedMethods(methods);
              if (methods.length > 0) {
                setPaymentMethod(methods[0]);
              }
            }
          } catch (e) {
            console.warn('No se pudo verificar el estado del comercio:', e);
          }
        }

        // Intento cargar bancos PSE si Wompi está disponible
        try {
          const banksList = await wompiService.getPseBanks();
          if (Array.isArray(banksList)) {
            setBanks(banksList);
            if (banksList.length > 0) setSelectedBank(banksList[0].financial_institution_code);
          }
        } catch {
          // Normal si Wompi Sandbox está deshabilitado
        }
      } catch (err) {
        console.error('Error inicializando checkout:', err);
      } finally {
        setIsPageLoading(false);
      }
    };
    initCheckout();
  }, [user, cart]);

  const handleUploadComprobante = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('El archivo del comprobante excede el tamaño máximo de 10 MB');
      return;
    }

    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      showError('Solo se admiten imágenes (JPG, PNG, WEBP) o documentos PDF.');
      return;
    }

    if (comprobanteUrl && comprobanteUrl.startsWith('blob:')) {
      URL.revokeObjectURL(comprobanteUrl);
    }

    setComprobanteFile(file);
    setComprobanteName(file.name);
    if (file.type.startsWith('image/')) {
      setComprobanteUrl(URL.createObjectURL(file));
    } else {
      setComprobanteUrl(file.name);
    }
    success('Comprobante seleccionado y listo para envío seguro');
  };

  // Tarifa de domicilio autoritativa fijada por el comercio (mínimo $2.000 COP)
  const deliveryFee = Math.max(2000, Number(storeCommerce?.tarifaDomicilio || 2000));
  const finalTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!cart) {
      showError('No se encontró carrito activo.');
      return;
    }
    if (!selectedAddressId) {
      showError('Por favor selecciona o añade una dirección de entrega.');
      return;
    }

    if (paymentMethod === 'BANCOLOMBIA' && !comprobanteFile && !comprobanteUrl) {
      showError('Debes adjuntar el comprobante de transferencia Bancolombia para continuar.');
      return;
    }

    // Re-verificación en tiempo real del estado del comercio antes del submit
    if (storeSucursal?.comercioId) {
      try {
        const freshCommerce = await commerceService.getCommerce(storeSucursal.comercioId);
        if (freshCommerce.abierto === false || freshCommerce.pausaManual) {
          setIsStoreOpen(false);
          setStoreCommerce(freshCommerce);
          showError(`El comercio ${freshCommerce.nombre} está cerrado en este momento. ${freshCommerce.mensajeEstado || ''}`);
          return;
        }
      } catch {
        // Continuar a validación de servidor
      }
    }

    if (!isStoreOpen) {
      showError('El comercio se encuentra actualmente cerrado. No es posible realizar el pedido en este momento.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Crear el pedido autoritativo en el backend con tarifa configurada del comercio y comprobante privado
      const pedido = await pedidoService.createOrder({
        carritoId: cart.id,
        direccionId: selectedAddressId,
        costoEnvio: deliveryFee,
        observaciones: observaciones.trim() || undefined,
        metodoPago: paymentMethod,
        comprobante: paymentMethod === 'BANCOLOMBIA' ? (comprobanteFile || undefined) : undefined,
        comprobantePagoUrl: paymentMethod === 'BANCOLOMBIA' && !comprobanteFile ? comprobanteUrl : undefined,
      });

      // 2. Limpiar carrito en frontend
      await clearCart();

      success(`¡Pedido #${pedido.id} creado con éxito!`);
      navigate(`/pedidos/${pedido.id}`);
    } catch (err) {
      const parsed = parseApiError(err);
      showError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAndReturnHome = async () => {
    await clearCart();
    navigate(APP_ROUTES.HOME);
  };

  if (isPageLoading || isCartLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando detalles para checkout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={APP_ROUTES.CART} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al carrito
      </Link>

      <h1 className="text-2xl font-black text-gray-900">Finalizar Compra</h1>

      {!isStoreOpen && storeCommerce && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm">El comercio se encuentra actualmente cerrado</h4>
              <p className="text-xs text-rose-700 mt-1">
                {storeCommerce.nombre} no está recibiendo pedidos en este momento.
                {storeCommerce.pausaManual ? ' La tienda está en pausa temporal.' : ` Horario de atención: ${storeCommerce.horaApertura || '08:00'} - ${storeCommerce.horaCierre || '22:00'} (${storeCommerce.diasAtencion || 'Lunes a Domingo'}).`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-200/60">
            <Link to={APP_ROUTES.HOME}>
              <Button variant="outline" size="sm" className="bg-white">
                Volver al Inicio
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearAndReturnHome}
              className="text-rose-700 hover:bg-rose-100"
            >
              Vaciar Carrito y Explorar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Direcciones */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-800" /> Dirección de Entrega
            </h3>
            <Link to={APP_ROUTES.ADDRESSES} className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Nueva Dirección
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
              <p className="font-bold">No tienes direcciones registradas.</p>
              <Link to={APP_ROUTES.ADDRESSES} className="underline font-bold mt-1 inline-block">
                Agregar una dirección ahora
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-gray-900">{addr.alias}</span>
                    {addr.principal && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Principal</span>}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{addr.direccion}</p>
                  <p className="text-[11px] text-gray-400">{addr.ciudad}, {addr.departamento || 'Colombia'}</p>
                </label>
              ))}
            </div>
          )}

          <Input
            label="Notas para el repartidor (Opcional)"
            placeholder="Ej: Apto 302, dejar en portería..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Card>

        {/* Método de Pago */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-800" /> Método de Pago
            </h3>
            {storeCommerce && (
              <span className="text-[11px] text-gray-500">
                Aceptados por {storeCommerce.nombre}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {acceptedMethods.includes('EFECTIVO') && (
              <button
                type="button"
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                💵 Efectivo
              </button>
            )}

            {(acceptedMethods.includes('BANCOLOMBIA') || storeCommerce?.bancolombiaActivo) && (
              <button
                type="button"
                onClick={() => setPaymentMethod('BANCOLOMBIA')}
                className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'BANCOLOMBIA'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                🟡 Bancolombia
              </button>
            )}

            {acceptedMethods.includes('TARJETA') && (
              <button
                type="button"
                onClick={() => setPaymentMethod('TARJETA')}
                className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'TARJETA'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                💳 Tarjeta
              </button>
            )}

            {acceptedMethods.includes('PSE') && (
              <button
                type="button"
                onClick={() => setPaymentMethod('PSE')}
                className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'PSE'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                🔵 PSE
              </button>
            )}

            {(acceptedMethods.includes('TRANSFERENCIA') || acceptedMethods.includes('NEQUI')) && (
              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                  paymentMethod === 'TRANSFERENCIA' || paymentMethod === 'NEQUI'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-sm'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                🟣 Nequi / Daviplata
              </button>
            )}
          </div>

          {/* Bancolombia Transfer Details and Receipt Upload */}
          {paymentMethod === 'BANCOLOMBIA' && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  Datos para Transferencia Bancolombia
                </h4>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                  Comprobante Obligatorio
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-amber-200">
                <div>
                  <span className="text-gray-500 font-semibold block text-[11px]">Banco:</span>
                  <span className="font-bold text-gray-900">Bancolombia</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[11px]">Tipo de Cuenta:</span>
                  <span className="font-bold text-gray-900">
                    {storeCommerce?.bancolombiaTipoCuenta === 'CORRIENTE' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'}
                  </span>
                </div>
                <div className="sm:col-span-2 flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <span className="text-gray-500 font-semibold block text-[11px]">Número de Cuenta:</span>
                    <span className="font-black text-sm text-gray-900 tracking-wide font-mono">
                      {storeCommerce?.bancolombiaNumeroCuenta || 'Consultar con el comercio'}
                    </span>
                  </div>
                  {storeCommerce?.bancolombiaNumeroCuenta && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(storeCommerce.bancolombiaNumeroCuenta);
                        success('¡Número de cuenta copiado al portapapeles!');
                      }}
                      className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-100/50 rounded-lg transition-colors"
                      title="Copiar número"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[11px]">Titular:</span>
                  <span className="font-bold text-gray-900">{storeCommerce?.bancolombiaTitular || 'Comercio'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[11px]">Documento (NIT/CC):</span>
                  <span className="font-bold text-gray-900">{storeCommerce?.bancolombiaDocTitular || 'N/A'}</span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Valor Exacto a Transferir:</span>
                  <span className="text-base font-black text-emerald-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Adjuntar Comprobante */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Adjuntar Comprobante de Pago <span className="text-rose-500">*</span>
                </label>

                {comprobanteName ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      {comprobanteName.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      ) : comprobanteUrl.startsWith('blob:') ? (
                        <img
                          src={comprobanteUrl}
                          alt="Comprobante"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                      ) : (
                        <img
                          src={uploadService.getImageUrl(comprobanteUrl)}
                          alt="Comprobante"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">Comprobante adjuntado</p>
                        <p className="text-[11px] text-gray-500 truncate">{comprobanteName}</p>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle className="w-3 h-3" /> Listo para validación privada del comercio
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer text-xs font-bold text-purple-600 hover:text-purple-700 px-2 py-1 rounded">
                        Cambiar
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                          className="hidden"
                          onChange={handleUploadComprobante}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (comprobanteUrl && comprobanteUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(comprobanteUrl);
                          }
                          setComprobanteFile(null);
                          setComprobanteUrl('');
                          setComprobanteName('');
                        }}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 rounded-2xl cursor-pointer transition-colors text-center">
                    <Upload className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-xs font-bold text-gray-900">
                      Subir Comprobante de Pago
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1">
                      Adjunta foto/captura o archivo JPG, PNG, WEBP o PDF (máx. 10MB) - Envío Privado Protegido
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleUploadComprobante}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {(paymentMethod === 'TRANSFERENCIA' || paymentMethod === 'NEQUI') && (
            <Input
              label="Número de Celular para Confirmación de Transferencia"
              placeholder="3001234567"
              value={nequiPhone}
              onChange={(e) => setNequiPhone(e.target.value)}
              helperText="Podrás enviar el comprobante directamente al comercio o al repartidor."
            />
          )}

          {paymentMethod === 'PSE' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Banco PSE</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm"
              >
                {banks.length > 0 ? (
                  banks.map((b) => (
                    <option key={b.financial_institution_code} value={b.financial_institution_code}>
                      {b.financial_institution_name}
                    </option>
                  ))
                ) : (
                  <option value="1007">Bancolombia (Sandbox)</option>
                )}
              </select>
            </div>
          )}

          {paymentMethod === 'EFECTIVO' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
              💵 Pagarás en efectivo al momento de recibir tu entrega de manos del domiciliario.
            </div>
          )}

          {paymentMethod === 'TARJETA' && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800">
              💳 El datáfono del comercio será llevado por el repartidor para tu pago electrónico con tarjeta.
            </div>
          )}
        </Card>

        {/* Resumen Final y Botón de Pago */}
        <Card className="p-6 space-y-4 bg-gray-900 text-white">
          <div className="space-y-2 border-b border-gray-800 pb-4">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal Productos ({items.length} {items.length === 1 ? 'ítem' : 'ítems'})</span>
              <span className="font-semibold text-gray-200">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                Tarifa Domicilio ({storeCommerce?.nombre || 'Comercio'})
              </span>
              <span className="font-semibold text-emerald-400">{formatCurrency(deliveryFee)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Final a Pagar</p>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(finalTotal)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Método de pago: <span className="text-emerald-400 font-bold">{paymentMethod}</span>
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              isLoading={isLoading}
              disabled={addresses.length === 0 || !isStoreOpen}
            >
              {!isStoreOpen ? 'Comercio Cerrado' : `Aceptar y Pagar ${formatCurrency(finalTotal)}`}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
