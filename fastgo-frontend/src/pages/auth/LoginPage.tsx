import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FastGoLogo } from '../../components/common/FastGoLogo';
import { APP_ROUTES } from '../../constants/routes';
import { parseApiError } from '../../utils/errorHandler';
import { authService } from '../../services/authService';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, role } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || null;
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [multiRoles, setMultiRoles] = useState<Role[]>([]);
  const [pendingUser, setPendingUser] = useState<any>(null);

  const routeByRole = (targetRole: string) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (targetRole === 'COMERCIO') {
      navigate(APP_ROUTES.COMMERCE_DASHBOARD, { replace: true });
    } else if (targetRole === 'DOMICILIARIO') {
      navigate(APP_ROUTES.DELIVERY_DASHBOARD, { replace: true });
    } else if (targetRole === 'ADMIN') {
      navigate(APP_ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else {
      navigate(APP_ROUTES.HOME, { replace: true });
    }
  };

  const handleRoleSelection = async (selected: Role) => {
    setIsLoading(true);
    try {
      await authService.cambiarRol(selected);
      success(`Perfil cambiado a ${selected}. ¡Bienvenido!`);
      routeByRole(selected);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!correo || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const { user: loggedUser, loginResponse } = await login({
        correo,
        password,
      });

      const roles = loginResponse.availableRoles || (loggedUser.rol ? [loggedUser.rol] : []);
      if (roles.length > 1) {
        setMultiRoles(roles);
        setPendingUser(loggedUser);
        setShowRoleSelector(true);
        return;
      }

      success(`¡Bienvenido a FastGo, ${loggedUser.nombre}!`);
      routeByRole(loggedUser.activeRole || loggedUser.rol);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{ backgroundImage: "url('/assets/images/login-fondo.jpg')" }}
      />
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <FastGoLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Iniciar Sesión</h1>
          <p className="text-sm text-gray-500">Ingresa tus credenciales para acceder a FastGo</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {showRoleSelector ? (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-gray-900">¿Cómo quieres usar FASTGO hoy?</h2>
              <p className="text-xs text-gray-500">Tu cuenta tiene múltiples perfiles habilitados. Elige uno para continuar:</p>
            </div>

            <div className="space-y-3">
              {multiRoles.map((r) => {
                const roleLabels: Record<string, { title: string; desc: string; icon: string }> = {
                  CLIENTE: { title: 'Cliente', desc: 'Comprar comida, productos y enviar paquetes', icon: '🛍️' },
                  COMERCIO: { title: 'Comercio', desc: 'Gestionar mi tienda, catálogo, stock y pedidos', icon: '🏪' },
                  DOMICILIARIO: { title: 'Domiciliario', desc: 'Aceptar y entregar pedidos y encomiendas', icon: '🛵' },
                  ADMIN: { title: 'Administrador', desc: 'Panel de administración general', icon: '⚙️' },
                };
                const meta = roleLabels[r] || { title: r, desc: 'Acceder como ' + r, icon: '👤' };

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelection(r)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left group shadow-sm"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-gray-100 group-hover:bg-emerald-100 transition-colors">
                      {meta.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 group-hover:text-emerald-700 text-sm">
                        {meta.title}
                      </div>
                      <div className="text-xs text-gray-500">{meta.desc}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>
        )}

        {!showRoleSelector && (
          <div className="text-center text-xs text-gray-500 pt-2">
            ¿No tienes una cuenta?{' '}
            <Link to={APP_ROUTES.REGISTER} className="font-bold text-gray-900 hover:underline">
              Regístrate aquí
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
