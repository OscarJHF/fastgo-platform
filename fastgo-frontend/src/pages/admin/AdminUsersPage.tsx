import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, Shield } from 'lucide-react';
import { userService } from '../../services/userService';
import { AuthUser } from '../../types';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { APP_ROUTES } from '../../constants/routes';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.listUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
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
          <h1 className="text-2xl font-black text-gray-900">Usuarios del Sistema ({users.length})</h1>
          <p className="text-xs text-gray-500">Clientes, Comercios, Domiciliarios y Administradores</p>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-mono text-gray-400">#{u.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{u.nombre} {u.apellido}</td>
                  <td className="py-3 px-4 text-gray-600">{u.correo}</td>
                  <td className="py-3 px-4 text-gray-600">{u.telefono}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.rol === 'ADMIN' ? 'danger' : u.rol === 'COMERCIO' ? 'info' : u.rol === 'DOMICILIARIO' ? 'warning' : 'secondary'}>
                      {u.rol}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${u.estado ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {u.estado ? '● Activo' : '○ Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
