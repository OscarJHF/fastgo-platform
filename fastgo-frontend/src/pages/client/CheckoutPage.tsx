import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, ArrowLeft, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { direccionService } from '../../services/direccionService';
import { pedidoService } from '../../services/pedidoService';
import { wompiService } from '../../services/wompiService';
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
  const [paymentMethod, setPaymentMethod] = useState<'NEQUI' | 'PSE'>('NEQUI');
  const [nequiPhone, setNequiPhone] = useState(user?.telefono || '');
  const [banks, setBanks] = useState<WompiBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        const addressList = await direccionService.listMyAddresses();
        setAddresses(addressList);
        if (addressList.length > 0) {
          const principal = addressList.find((a) => a.principal) || addressList[0];
          setSelectedAddressId(principal.id);
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
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!cart) {
      showError('No se encontró carrito activo.');
      return;
    }
    if (!selectedAddressId) {
      showError('Por favor selecciona o añade una dirección de entrega.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Crear el pedido autoritativo en el backend
      const pedido = await pedidoService.createOrder({
        carritoId: cart.id,
        direccionId: selectedAddressId,
        costoEnvio: 0,
        observaciones: observaciones.trim() || undefined,
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
          <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-800" /> Método de Pago (Wompi)
          </h3>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pasarela Wompi en Modo Seguro / Demostración</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                La integración bancaria con Wompi está deshabilitada en este entorno (<code className="font-mono bg-amber-100 px-1 rounded">fastgo.wompi.enabled=false</code>). El pedido se registrará de manera autoritativa en estado <strong>PENDIENTE</strong> sin debitar fondos reales ni simular una aprobación financiera falsa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('NEQUI')}
              className={`p-4 rounded-2xl border text-center transition-all ${
                paymentMethod === 'NEQUI'
                  ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              🟣 Nequi
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('PSE')}
              className={`p-4 rounded-2xl border text-center transition-all ${
                paymentMethod === 'PSE'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              🔵 PSE (Bancos)
            </button>
          </div>

          {paymentMethod === 'NEQUI' ? (
            <Input
              label="Número de Celular Nequi"
              placeholder="3001234567"
              value={nequiPhone}
              onChange={(e) => setNequiPhone(e.target.value)}
              helperText="Recibirás una notificación en tu app Nequi para autorizar el cobro."
            />
          ) : (
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
        </Card>

        {/* Resumen Final y Botón de Pago */}
        <Card className="p-6 space-y-4 bg-gray-900 text-white">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Total a Pagar</p>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(subtotal)}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              isLoading={isLoading}
              disabled={addresses.length === 0}
            >
              Confirmar y Crear Pedido
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
