import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle, Store, Bike } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FastGoLogo } from '../../components/common/FastGoLogo';
import { APP_ROUTES } from '../../constants/routes';
import { parseApiError } from '../../utils/errorHandler';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    password: string;
    confirmPassword: string;
    rol: 'CLIENTE' | 'COMERCIO' | 'DOMICILIARIO';
  }>({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: 'CLIENTE',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono,
        password: formData.password,
        rol: formData.rol,
      });
      success('¡Registro exitoso! Bienvenido a FastGo.');
      navigate(APP_ROUTES.HOME);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMsg(parsed.message);
      if (parsed.fields) {
        setFieldErrors(parsed.fields);
      }
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
      <div className="max-w-lg w-full bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <FastGoLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Crear Cuenta FastGo</h1>
          <p className="text-sm text-gray-500">Únete para pedir de los mejores comercios a tu puerta</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Rol */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              ¿Cómo deseas unirte a FastGo?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleChange('rol', 'CLIENTE')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  formData.rol === 'CLIENTE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <User className={`w-5 h-5 ${formData.rol === 'CLIENTE' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold">Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => handleChange('rol', 'COMERCIO')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  formData.rol === 'COMERCIO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Store className={`w-5 h-5 ${formData.rol === 'COMERCIO' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold">Comercio</span>
              </button>

              <button
                type="button"
                onClick={() => handleChange('rol', 'DOMICILIARIO')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  formData.rol === 'DOMICILIARIO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Bike className={`w-5 h-5 ${formData.rol === 'DOMICILIARIO' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold">Domiciliario</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Juan"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              icon={<User className="w-4 h-4" />}
              error={fieldErrors['nombre']}
              required
            />
            <Input
              label="Apellido"
              placeholder="Pérez"
              value={formData.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              icon={<User className="w-4 h-4" />}
              error={fieldErrors['apellido']}
              required
            />
          </div>

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="juan.perez@ejemplo.com"
            value={formData.correo}
            onChange={(e) => handleChange('correo', e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            error={fieldErrors['correo']}
            required
          />

          <Input
            label="Teléfono Celular"
            placeholder="3001234567"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            icon={<Phone className="w-4 h-4" />}
            error={fieldErrors['telefono']}
            helperText="Formato de 10 dígitos (ej. 3001234567)"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={fieldErrors['password']}
              required
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Crear Mi Cuenta
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2">
          ¿Ya tienes una cuenta?{' '}
          <Link to={APP_ROUTES.LOGIN} className="font-bold text-gray-900 hover:underline">
            Ingresa aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
