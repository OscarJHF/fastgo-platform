import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Utensils, ShoppingBag, MapPin, Plus, CheckCircle, Clock } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { pedidoService } from '../../services/pedidoService';
import { Comercio, Sucursal, Pedido } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { APP_ROUTES } from '../../constants/routes';

export const CommerceDashboardPage: React.FC = () => {
  const [commerces, setCommerces] = useState<Comercio[]>([]);
  const [activeCommerce, setActiveCommerce] = useState<Comercio | null>(null);
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [activeBranch, setActiveBranch] = useState<Sucursal | null>(null);
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const coms = await commerceService.listCommerces();
        setCommerces(coms);
        if (coms.length > 0) {
          const firstCom = coms[0];
          setActiveCommerce(firstCom);
          const sucs = await sucursalService.listByCommerce(firstCom.id);
          setBranches(sucs);
          if (sucs.length > 0) {
            setActiveBranch(sucs[0]);
            const ords = await pedidoService.listBySucursal(sucs[0].id).catch(() => []);
            setOrders(ords);
          }
        }
      } catch (err) {
        console.error('Error cargando panel comercio:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'CONFIRMADO').length;
  const preparingCount = orders.filter((o) => o.estado === 'EN_PREPARACION').length;
  const readyCount = orders.filter((o) => o.estado === 'LISTO_PARA_ENTREGA').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Panel de Administración de Comercio</h1>
          <p className="text-xs text-gray-500">
            {activeCommerce ? `Gestionando: ${activeCommerce.nombre}` : 'Bienvenido al panel comercial'}
          </p>
        </div>

        <div className="flex gap-2">
          <Link to={APP_ROUTES.COMMERCE_ORDERS}>
            <Button variant="primary" size="sm" icon={<ShoppingBag className="w-4 h-4" />}>
              Ver Pedidos
            </Button>
          </Link>
          <Link to={APP_ROUTES.COMMERCE_PRODUCTS}>
            <Button variant="secondary" size="sm" icon={<Utensils className="w-4 h-4" />}>
              Productos
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold uppercase text-gray-400">Por Confirmar</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-1">Requieren atención inmediata</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-500">
          <p className="text-xs font-bold uppercase text-gray-400">En Preparación</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{preparingCount}</p>
          <p className="text-xs text-purple-600 mt-1">En cocina / empaque</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold uppercase text-gray-400">Listos para Domiciliario</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{readyCount}</p>
          <p className="text-xs text-emerald-600 mt-1">Esperando recogida</p>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={APP_ROUTES.COMMERCE_ORDERS}>
          <Card hoverable className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-gray-900">Gestión de Pedidos</h3>
              <p className="text-xs text-gray-500 mt-1">
                Acepta, prepara y marca como listos los pedidos en tiempo real con la máquina de estados.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 mt-4 inline-block">Gestionar pedidos →</span>
          </Card>
        </Link>

        <Link to={APP_ROUTES.COMMERCE_PRODUCTS}>
          <Card hoverable className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-gray-900">Catálogo de Productos</h3>
              <p className="text-xs text-gray-500 mt-1">
                Agrega nuevos platos, actualiza precios autoritativos, stock y disponibilidad.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-4 inline-block">Gestionar catálogo →</span>
          </Card>
        </Link>

        <Link to={APP_ROUTES.COMMERCE_BRANCHES}>
          <Card hoverable className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-gray-900">Sucursales y Sedes</h3>
              <p className="text-xs text-gray-500 mt-1">
                Configura direcciones físicas, radio de entrega y apertura/cierre de sucursales.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 mt-4 inline-block">Gestionar sedes →</span>
          </Card>
        </Link>
      </div>
    </div>
  );
};
