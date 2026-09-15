import React from 'react';
import { User, Mail, Phone, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Mi Perfil</h1>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-2xl text-white shadow-md shadow-emerald-600/20">
            {user.nombre.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{user.nombre} {user.apellido}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">{user.rol}</Badge>
              {user.estado && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Cuenta Activa
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</p>
              <p className="font-bold text-gray-800">{user.correo}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teléfono de Contacto</p>
              <p className="font-bold text-gray-800">{user.telefono}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rol en el Sistema</p>
              <p className="font-bold text-gray-800">{user.rol}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
