import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Package, ShoppingBag } from 'lucide-react';
import { pedidoService } from '../../services/pedidoService';
import { Pedido } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_DETAILS } from '../../constants/orderStatus';
import { APP_ROUTES } from '../../constants/routes';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await pedidoService.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error cargando pedidos:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando tu historial de pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mis Pedidos</h1>
          <p className="text-xs text-gray-500">Historial y estado de tus órdenes en curso</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800">Aún no has realizado pedidos</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">¿Qué tal pedir algo delicioso ahora mismo?</p>
          <Link to={APP_ROUTES.HOME}>
            <button className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors">
              Explorar Comercios
            </button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = ORDER_STATUS_DETAILS[order.estado] || {
              label: order.estado,
              badgeClass: 'bg-gray-100 text-gray-700',
            };

            return (
              <Link key={order.id} to={`/pedidos/${order.id}`}>
                <Card hoverable className="flex items-center justify-between p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-gray-900">Pedido #{order.id}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(order.creadoEn)}</p>
                    <p className="text-xs font-black text-gray-900 pt-1">
                      Total: {formatCurrency(order.total)}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-black">
                    Detalles <ChevronRight className="w-4 h-4 ml-1 text-emerald-600" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
