import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/common/Button';
import { APP_ROUTES } from '../constants/routes';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20 px-4">
      <h1 className="text-6xl font-black text-emerald-600 mb-2">404</h1>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Página no encontrada</h2>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
        La ruta que buscas no existe o no se encuentra disponible en FastGo.
      </p>
      <Link to={APP_ROUTES.HOME}>
        <Button variant="primary" icon={<Home className="w-4 h-4" />}>
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
};
