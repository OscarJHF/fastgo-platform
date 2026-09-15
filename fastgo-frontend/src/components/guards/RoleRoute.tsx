import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { APP_ROUTES } from '../../constants/routes';

interface RoleRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Autenticación Requerida</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Debes iniciar sesión con una cuenta autorizada para acceder a este módulo.
        </p>
        <Link to={APP_ROUTES.LOGIN}>
          <Button variant="primary">Ir a Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="text-center py-16 px-4 max-w-lg mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
          <ShieldX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Acceso Denegado (403)</h2>
        <p className="text-sm text-gray-500 mb-2">
          Tu cuenta con rol <span className="font-bold text-gray-900 uppercase">[{role}]</span> no cuenta con los permisos necesarios para acceder a esta área.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Roles requeridos: {allowedRoles.join(', ')}
        </p>
        <Link to={APP_ROUTES.HOME}>
          <Button variant="secondary">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
