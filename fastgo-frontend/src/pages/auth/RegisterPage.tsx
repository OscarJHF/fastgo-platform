import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle, Store, Bike, Sparkles, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FastGoLogo } from '../../components/common/FastGoLogo';
import { APP_ROUTES } from '../../constants/routes';
import { parseApiError } from '../../utils/errorHandler';
import { authService } from '../../services/authService';
import { DatosUsuarioReutilizables } from '../../types';

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

  const [reusableData, setReusableData] = useState<DatosUsuarioReutilizables | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Reutilización inteligente de datos al escribir/desenfocar correo
  const verificarCorreoExistente = async (emailToCheck: string) => {
    const trimmed = emailToCheck.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setReusableData(null);
      return;
    }

    setCheckingEmail(true);
    try {
      const data = await authService.getDatosReutilizables(trimmed);
      if (data && data.rolesExistentes && data.rolesExistentes.length > 0) {
        setReusableData(data);
        // Pre-llenar datos personales automáticamente
        setFormData((prev) => ({
          ...prev,
          nombre: prev.nombre || data.nombre || '',
          apellido: prev.apellido || data.apellido || '',
          telefono: prev.telefono || data.telefono || '',
        }));

        // Si el rol actualmente seleccionado ya está registrado, sugerir otro disponible
        if (data.rolesExistentes.includes(formData.rol)) {
          const rolesPosibles: Array<'CLIENTE' | 'COMERCIO' | 'DOMICILIARIO'> = ['CLIENTE', 'COMERCIO', 'DOMICILIARIO'];
          const primerDisponible = rolesPosibles.find(r => !data.rolesExistentes.includes(r));
          if (primerDisponible) {
            setFormData(prev => ({ ...prev, rol: primerDisponible }));
          }
        }
      } else {
        setReusableData(null);
      }
    } catch {
      // Silencioso si falla la verificación
      setReusableData(null);
    } finally {
      setCheckingEmail(false);
    }
  };

  const isCurrentRoleRegistered = Boolean(
    reusableData?.rolesExistentes?.includes(formData.rol)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (isCurrentRoleRegistered) {
      setErrorMsg(`El correo "${formData.correo}" ya tiene una cuenta activa como ${formData.rol}. Por favor inicia sesión directamente con tu contraseña o selecciona otro rol.`);
      return;
    }

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
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        rol: formData.rol,
      });

      success(`¡Registro exitoso como ${formData.rol}! Bienvenido a FastGo.`);

      // Redirección inmediata según el rol registrado (Direct Post-Login / Post-Register)
      if (formData.rol === 'COMERCIO') {
        navigate(APP_ROUTES.COMMERCE_DASHBOARD, { replace: true });
      } else if (formData.rol === 'DOMICILIARIO') {
        navigate(APP_ROUTES.DELIVERY_DASHBOARD, { replace: true });
      } else {
        navigate(APP_ROUTES.HOME, { replace: true });
      }
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
          <p className="text-sm text-gray-500">Únete para pedir de los mejores comercios, enviar encomiendas o generar ingresos</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Banner de Reutilización Inteligente de Datos */}
        {reusableData && reusableData.rolesExistentes.length > 0 && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Cuenta existente detectada!</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Hemos precargado tus datos personales. Tu correo ya cuenta con perfil de:{' '}
              <strong className="underline">{reusableData.rolesExistentes.join(', ')}</strong>.
              Puedes registrar un nuevo rol sin perder tu cuenta existente.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Correo Electrónico PRIMERO para predecir y precargar datos */}
          <div>
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={formData.correo}
              onChange={(e) => handleChange('correo', e.target.value)}
              onBlur={(e) => verificarCorreoExistente(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              error={fieldErrors['correo']}
              helperText={checkingEmail ? 'Verificando cuentas asociadas...' : 'Si ya tienes cuenta en FastGo, reutilizaremos tus datos para tu nuevo rol.'}
              required
            />
          </div>

          {/* Selector de Rol */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              ¿Cómo deseas unirte a FastGo?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleChange('rol', 'CLIENTE')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 relative ${
                  formData.rol === 'CLIENTE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <User className={`w-5 h-5 ${formData.rol === 'CLIENTE' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold">Cliente</span>
                {reusableData?.rolesExistentes?.includes('CLIENTE') && (
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded-full font-semibold">
                    Registrado
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleChange('rol', 'COMERCIO')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 relative ${
                  formData.rol === 'COMERCIO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Store className={`w-5 h-5 ${formData.rol === 'COMERCIO' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold">Comercio</span>
                {reusableData?.rolesExistentes?.includes('COMERCIO') && (
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded-full font-semibold">
                    Registrado
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleChange('rol', 'DOMICILIARIO')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 relative ${
                  formData.rol === 'DOMICILIARIO'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <Bike className={`w-5 h-5 ${formData.rol === 'DOMICILIARIO' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-xs font-bold">Domiciliario</span>
                {reusableData?.rolesExistentes?.includes('DOMICILIARIO') && (
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded-full font-semibold">
                    Registrado
                  </span>
                )}
              </button>
            </div>
            {isCurrentRoleRegistered && (
              <p className="text-[11px] text-amber-700 flex items-center gap-1 mt-1 font-medium">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Ya estás registrado como {formData.rol}. Selecciona otro rol o inicia sesión.
              </p>
            )}
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

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="w-full" 
            isLoading={isLoading}
            disabled={isCurrentRoleRegistered}
          >
            {isCurrentRoleRegistered ? `Ya registrado como ${formData.rol}` : `Crear Mi Cuenta como ${formData.rol}`}
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
