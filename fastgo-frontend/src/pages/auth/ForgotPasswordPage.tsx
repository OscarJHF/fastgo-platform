import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FastGoLogo } from '../../components/common/FastGoLogo';
import { APP_ROUTES } from '../../constants/routes';
import { authService } from '../../services/authService';
import { parseApiError } from '../../utils/errorHandler';

export const ForgotPasswordPage: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!correo.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(correo.trim());
      setSuccessMsg(res.message || 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.');
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Recuperar Contraseña</h1>
          <p className="text-sm text-gray-500">
            Ingresa tu correo para recibir un enlace seguro de restablecimiento.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs leading-relaxed">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-emerald-900 mb-1">Solicitud procesada</p>
                <p>{successMsg}</p>
              </div>
            </div>
            <Link
              to={APP_ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Iniciar Sesión
            </Link>
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

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
              Enviar Instrucciones
            </Button>

            <div className="text-center pt-2">
              <Link
                to={APP_ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};