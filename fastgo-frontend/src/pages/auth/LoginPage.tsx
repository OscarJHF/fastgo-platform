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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!correo || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ correo, password });
      success('¡Bienvenido a FastGo!');
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(APP_ROUTES.HOME);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (emailVal: string) => {
    setCorreo(emailVal);
    if (emailVal.includes('admin')) setPassword('AdminPassword123!');
    else if (emailVal.includes('comercio')) setPassword('ComercioPassword123!');
    else if (emailVal.includes('domiciliario')) setPassword('DomiciliarioPassword123!');
    else setPassword('ClientePassword123!');
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

        {/* Cuentas de Demostración Rápida */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2.5">
            Acceso Rápido de Prueba (Demo)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('cliente@fastgo.com')}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-center border border-blue-200 transition-colors"
            >
              👤 Cliente
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('comercio@fastgo.com')}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-center border border-purple-200 transition-colors"
            >
              🏪 Comercio
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('domiciliario@fastgo.com')}
              className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-center border border-amber-200 transition-colors"
            >
              🛵 Domiciliario
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@fastgo.com')}
              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-center border border-rose-200 transition-colors"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pt-2">
          ¿No tienes una cuenta?{' '}
          <Link to={APP_ROUTES.REGISTER} className="font-bold text-gray-900 hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
