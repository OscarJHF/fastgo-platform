import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Clock,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { categoriaService } from '../../services/categoriaService';
import { Comercio, CategoriaComercio, ComercioRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { APP_ROUTES } from '../../constants/routes';

export const CommerceStoreConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingStore, setExistingStore] = useState<Comercio | null>(null);
  const [categories, setCategories] = useState<CategoriaComercio[]>([]);

  const [formData, setFormData] = useState<ComercioRequest>({
    nombre: '',
    categoriaId: 1,
    descripcion: '',
    telefono: '',
    correo: '',
    direccion: '',
    ciudad: 'Bogotá',
    logo: '',
    banner: '',
    nit: '',
    activo: true,
    metodosPago: 'EFECTIVO, TARJETA, PSE, TRANSFERENCIA',
    horaApertura: '08:00',
    horaCierre: '20:00',
    diasAtencion: 'Lunes a Domingo',
    tiempoPreparacionMin: 25,
  });

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const [cats, own] = await Promise.all([
          categoriaService.listActiveCommerceCategories().catch(() => []),
          commerceService.getPropio().catch(() => null),
        ]);

        setCategories(cats);

        if (own) {
          setExistingStore(own);
          setFormData({
            nombre: own.nombre || '',
            categoriaId: own.categoriaId || (cats.length > 0 ? cats[0].id : 1),
            descripcion: own.descripcion || '',
            telefono: own.telefono || '',
            correo: own.correo || '',
            direccion: own.direccion || '',
            ciudad: own.ciudad || 'Bogotá',
            logo: own.logo || '',
            banner: own.banner || '',
            nit: own.nit || '',
            activo: own.activo ?? true,
            metodosPago: own.metodosPago || 'EFECTIVO, TARJETA, PSE, TRANSFERENCIA',
            horaApertura: own.horaApertura || '08:00',
            horaCierre: own.horaCierre || '20:00',
            diasAtencion: own.diasAtencion || 'Lunes a Domingo',
            tiempoPreparacionMin: own.tiempoPreparacionMin || 25,
            pausaManual: own.pausaManual ?? false,
          });
        } else if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoriaId: cats[0].id }));
        }
      } catch (err) {
        console.error('Error cargando datos de la tienda:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'categoriaId' || name === 'tiempoPreparacionMin') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showError('El nombre comercial de la tienda es obligatorio');
      return;
    }
    if (!formData.categoriaId) {
      showError('Debes seleccionar una categoría o sector comercial');
      return;
    }

    setIsSaving(true);
    try {
      if (existingStore) {
        const updated = await commerceService.updateCommerce(existingStore.id, formData);
        setExistingStore(updated);
        success('¡Tienda actualizada exitosamente!');
      } else {
        const created = await commerceService.createCommerce(formData);
        setExistingStore(created);
        success('¡Tu tienda ha sido creada y configurada con éxito!');
      }
      setTimeout(() => {
        navigate(APP_ROUTES.COMMERCE_DASHBOARD);
      }, 800);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar la configuración de la tienda';
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando perfil de tu tienda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={APP_ROUTES.COMMERCE_DASHBOARD}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Panel
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-purple-600" />
            {existingStore ? 'Configuración de Mi Tienda' : 'Crear y Configurar Mi Tienda'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Personaliza tu perfil comercial, datos de contacto, horarios y visibilidad para tus clientes.
          </p>
        </div>

        {existingStore && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant={formData.activo ? 'success' : 'warning'}>
              {formData.activo ? 'Publicada para Clientes' : 'Oculta / Borrador'}
            </Badge>
          </div>
        )}
      </div>

      {/* Multi-sector announcement banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-200/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-950">
          <p className="font-extrabold text-sm text-purple-900">FASTGO es para todo tipo de comercios</p>
          <p className="mt-0.5 text-purple-800">
            Restaurantes, tiendas de ropa, verdulerías / fruvers, minimercados, tecnología, farmacias, tiendas de mascotas y más. Configura tu catálogo y empieza a recibir pedidos directos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Commercial Profile */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-600" />
              1. Identidad Comercial y Sector
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Nombre que verán los clientes en la plataforma y categoría de negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Nombre Comercial de la Tienda <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Tienda de Ropa Urbana, Fruver Fresco, Restaurante Sol..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Sector o Categoría Comercial <span className="text-rose-500">*</span>
              </label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Descripción del Comercio
              </label>
              <textarea
                name="descripcion"
                rows={3}
                value={formData.descripcion || ''}
                onChange={handleChange}
                placeholder="Cuéntale a tus clientes qué ofreces, promociones especiales o especialidades de tu negocio..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                NIT o Documento Comercial (Opcional)
              </label>
              <input
                type="text"
                name="nit"
                value={formData.nit || ''}
                onChange={handleChange}
                placeholder="Ej. 901.234.567-8"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Teléfono Comercial de Contacto
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono || ''}
                onChange={handleChange}
                placeholder="Ej. 3001234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Location and Physical Presence */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              2. Ubicación y Sede Principal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Dirección donde los domiciliarios recogerán los pedidos y paquetes para tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Dirección Sede Principal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                required
                value={formData.direccion || ''}
                onChange={handleChange}
                placeholder="Ej. Calle 45 # 12-34, Local 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Ciudad <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="ciudad"
                required
                value={formData.ciudad || ''}
                onChange={handleChange}
                placeholder="Ej. Bogotá, Medellín, Cali..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Operations & Hours */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              3. Horarios y Operación
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Controla cuándo tus clientes pueden comprar y los tiempos promedio de entrega.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Hora Apertura
              </label>
              <input
                type="time"
                name="horaApertura"
                value={formData.horaApertura || '08:00'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Hora Cierre
              </label>
              <input
                type="time"
                name="horaCierre"
                value={formData.horaCierre || '20:00'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Días de Atención
              </label>
              <input
                type="text"
                name="diasAtencion"
                value={formData.diasAtencion || 'Lunes a Domingo'}
                onChange={handleChange}
                placeholder="Ej. Lunes a Sábado"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Alistamiento Promedio (min)
              </label>
              <input
                type="number"
                name="tiempoPreparacionMin"
                min={1}
                max={240}
                value={formData.tiempoPreparacionMin || 25}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Branding & Images */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              4. Imagen y Marca
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Logotipo y foto de portada para destacar ante los clientes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                URL del Logo
              </label>
              <input
                type="url"
                name="logo"
                value={formData.logo || ''}
                onChange={handleChange}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.logo && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                  <img
                    src={formData.logo}
                    alt="Preview Logo"
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                  <span className="text-xs text-gray-500 font-medium">Vista previa de logo</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                URL del Banner o Portada
              </label>
              <input
                type="url"
                name="banner"
                value={formData.banner || ''}
                onChange={handleChange}
                placeholder="https://ejemplo.com/banner.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.banner && (
                <div className="mt-2 h-16 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={formData.banner}
                    alt="Preview Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Métodos de Pago Aceptados
              </label>
              <input
                type="text"
                name="metodosPago"
                value={formData.metodosPago || 'EFECTIVO, TARJETA, PSE, TRANSFERENCIA'}
                onChange={handleChange}
                placeholder="EFECTIVO, TARJETA, PSE, TRANSFERENCIA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Section 5: Publication Toggle */}
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                {formData.activo ? (
                  <Eye className="w-5 h-5 text-emerald-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-amber-600" />
                )}
                Estado de Publicación para Clientes
              </h2>
              <p className="text-xs text-gray-600">
                {formData.activo
                  ? 'Tu tienda está ACTIVA y VISIBLE para todos los clientes en FASTGO. Podrán explorar tus productos y hacer pedidos.'
                  : 'Tu tienda está en MODO BORRADOR / OCULTA. Los clientes no la verán en el catálogo general hasta que la actives.'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo ?? true}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-black uppercase tracking-wider text-gray-800">
                {formData.activo ? 'Publicada' : 'Oculta'}
              </span>
            </label>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={APP_ROUTES.COMMERCE_DASHBOARD}>
            <Button variant="secondary" type="button" disabled={isSaving}>
              Cancelar
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            disabled={isSaving}
            icon={isSaving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Guardando...' : existingStore ? 'Guardar Cambios' : 'Crear Tienda'}
          </Button>
        </div>
      </form>
    </div>
  );
};
