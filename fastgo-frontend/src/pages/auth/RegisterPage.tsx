import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
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
