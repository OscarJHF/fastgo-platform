import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Tag, Shield, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { APP_ROUTES } from '../../constants/routes';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Panel de Control del Administrador</h1>
          <p className="text-xs text-gray-500">Supervisión integral de usuarios, comercios y categorías</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to={APP_ROUTES.ADMIN_USERS}>
          <Card hoverable className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-gray-900">Usuarios Registrados</h3>
              <p className="text-xs text-gray-500 mt-1">
                Consulta los clientes, comercios, domiciliarios y administradores del sistema.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 mt-4 inline-block">Ver usuarios →</span>
          </Card>
        </Link>

        <Link to={APP_ROUTES.ADMIN_CATEGORIES}>
          <Card hoverable className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-gray-900">Categorías de Producto</h3>
              <p className="text-xs text-gray-500 mt-1">
                Crea, edita y administra las categorías oficiales de productos para los menús.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-4 inline-block">Gestionar categorías →</span>
          </Card>
        </Link>

        <Link to={APP_ROUTES.ADMIN_COMMERCES}>
          <Card hoverable className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base text-gray-900">Comercios del Sistema</h3>
              <p className="text-xs text-gray-500 mt-1">
                Supervisa todos los comercios aliados activos y sus sucursales.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 mt-4 inline-block">Ver comercios →</span>
          </Card>
        </Link>
      </div>

      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-600" />
        <div>
          <p className="font-bold">Seguridad Operacional RBAC Activa</p>
          <p className="mt-0.5">
            Las contraseñas no se exponen en las respuestas de la API. Las credenciales de Wompi y Google Maps están resguardadas en variables de servidor.
          </p>
        </div>
      </div>
    </div>
  );
};
