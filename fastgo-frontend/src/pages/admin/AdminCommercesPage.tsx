import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { Comercio } from '../../types';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { APP_ROUTES } from '../../constants/routes';

export const AdminCommercesPage: React.FC = () => {
  const [commerces, setCommerces] = useState<Comercio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommerces = async () => {
      try {
        const data = await commerceService.listCommerces();
        setCommerces(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCommerces();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={APP_ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de administración
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Comercios Aliados ({commerces.length})</h1>
          <p className="text-xs text-gray-500">Comercios y tiendas registrados en FastGo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {commerces.map((c) => (
          <Card key={c.id} className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900">{c.nombre}</h3>
                <Badge variant={c.activo ? 'success' : 'danger'}>{c.activo ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <p className="text-xs text-gray-500">{c.descripcion || 'Sin descripción'}</p>
              {c.correo && <p className="text-xs text-gray-400">Contacto: {c.correo}</p>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
