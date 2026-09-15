import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { Spinner } from '../../components/common/Spinner';
import { APP_ROUTES } from '../../constants/routes';

export const CartPage: React.FC = () => {
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-gray-500 font-semibold">Cargando tu carrito...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-gray-300" />}
          title="Tu carrito está vacío"
          description="Explora los restaurantes y comercios aliados para agregar productos deliciosos a tu orden."
          actionText="Explorar Comercios"
          onAction={() => navigate(APP_ROUTES.HOME)}
        />
      </div>
    );
  }

  const shippingFee = 0; // Calculado autoritativamente por el servidor en creación de pedido
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={APP_ROUTES.HOME} className="text-gray-400 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Carrito de Compras ({itemCount})</h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          disabled={isLoading}
        >
          <Trash2 className="w-3.5 h-3.5" /> Vaciar Carrito
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 shrink-0 overflow-hidden">
                  {item.producto?.imagenPrincipal ? (
                    <img src={item.producto.imagenPrincipal} alt={item.producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    '🍽️'
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">{item.producto?.nombre || `Producto #${item.productoId}`}</h4>
                  <p className="text-xs text-gray-500 font-medium">{formatCurrency(item.precio)} c/u</p>
                  <p className="text-xs font-black text-gray-900 mt-1">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                    className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 text-xs font-bold">{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                    className="p-1.5 hover:bg-gray-200 text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                  title="Eliminar item"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-black text-base text-gray-900">Resumen del Pedido</h3>
            
            <div className="space-y-2 text-sm text-gray-600 border-b border-gray-100 pb-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-semibold text-emerald-600">Gratis (Beta 2)</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-extrabold text-base text-gray-900">Total</span>
              <span className="font-black text-xl text-gray-950">{formatCurrency(total)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate(APP_ROUTES.CHECKOUT)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continuar al Checkout
            </Button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              * El monto definitivo se calcula de forma autoritativa en el servidor al confirmar tu orden.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
