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
  CreditCard,
  DollarSign,
  Upload,
  X,
} from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { categoriaService } from '../../services/categoriaService';
import { uploadService } from '../../services/uploadService';
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

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

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
    tarifaDomicilio: 2000,
    bancolombiaActivo: false,
    bancolombiaTipoCuenta: 'AHORROS',
    bancolombiaNumeroCuenta: '',
    bancolombiaTitular: '',
    bancolombiaDocTitular: '',
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
            tarifaDomicilio: own.tarifaDomicilio ? Number(own.tarifaDomicilio) : 2000,
            bancolombiaActivo: own.bancolombiaActivo ?? false,
            bancolombiaTipoCuenta: own.bancolombiaTipoCuenta || 'AHORROS',
            bancolombiaNumeroCuenta: own.bancolombiaNumeroCuenta || '',
            bancolombiaTitular: own.bancolombiaTitular || '',
            bancolombiaDocTitular: own.bancolombiaDocTitular || '',
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
    } else if (name === 'categoriaId' || name === 'tiempoPreparacionMin' || name === 'tarifaDomicilio') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('El archivo excede el tamaño máximo de 10 MB');
      return;
    }

    if (field === 'logo') setIsUploadingLogo(true);
    else setIsUploadingBanner(true);

    try {
      const res = await uploadService.uploadFile(file);
      setFormData((prev) => ({ ...prev, [field]: res.url }));
      success('Imagen subida exitosamente');
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Error al subir imagen');
    } finally {
      if (field === 'logo') setIsUploadingLogo(false);
      else setIsUploadingBanner(false);
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

    if (formData.tarifaDomicilio !== undefined && Number(formData.tarifaDomicilio) < 2000) {
      showError('La tarifa de domicilio mínima permitida es de $2.000 COP');
      return;
    }

    if (formData.bancolombiaActivo) {
      if (
        !formData.bancolombiaNumeroCuenta?.trim() ||
        !formData.bancolombiaTitular?.trim() ||
        !formData.bancolombiaDocTitular?.trim()
      ) {
        showError('Para activar Bancolombia debes ingresar número de cuenta, titular y documento');
        return;
      }
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Logotipo del Comercio
              </label>
              
              {formData.logo ? (
                <div className="relative group p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
                  <img
                    src={uploadService.getImageUrl(formData.logo)}
                    alt="Logo"
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">Logo cargado</p>
                    <p className="text-[11px] text-gray-400 truncate">{formData.logo}</p>
                    <div className="flex gap-2 mt-2">
                      <label className="cursor-pointer text-xs font-bold text-purple-600 hover:text-purple-700">
                        Cambiar
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadImage(e, 'logo')}
                          disabled={isUploadingLogo}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logo: '' }))}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-purple-50/30 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700">
                    {isUploadingLogo ? 'Subiendo imagen...' : 'Subir archivo de logotipo'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG o WEBP (máx. 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImage(e, 'logo')}
                    disabled={isUploadingLogo}
                  />
                </label>
              )}

              <input
                type="text"
                name="logo"
                value={formData.logo || ''}
                onChange={handleChange}
                placeholder="O pega una URL directa de imagen..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Banner */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Banner o Portada
              </label>

              {formData.banner ? (
                <div className="relative group p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <div className="h-20 w-full rounded-xl overflow-hidden bg-white border border-gray-200">
                    <img
                      src={uploadService.getImageUrl(formData.banner)}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 truncate max-w-[200px]">{formData.banner}</span>
                    <div className="flex gap-2">
                      <label className="cursor-pointer text-xs font-bold text-purple-600 hover:text-purple-700">
                        Cambiar
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleUploadImage(e, 'banner')}
                          disabled={isUploadingBanner}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, banner: '' }))}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-purple-50/30 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-700">
                    {isUploadingBanner ? 'Subiendo imagen...' : 'Subir imagen de banner'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG o WEBP (máx. 10MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImage(e, 'banner')}
                    disabled={isUploadingBanner}
                  />
                </label>
              )}

              <input
                type="text"
                name="banner"
                value={formData.banner || ''}
                onChange={handleChange}
                placeholder="O pega una URL directa de imagen..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Métodos de Pago Informativos
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

        {/* Section 5: Delivery Rate */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              5. Tarifa de Domicilio y Envíos
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura la tarifa de domicilio que pagará el cliente y recibirá el domiciliario (mínimo $2.000 COP).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tarifa de Domicilio (COP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">
                  $
                </div>
                <input
                  type="number"
                  name="tarifaDomicilio"
                  min={2000}
                  step={500}
                  required
                  value={formData.tarifaDomicilio ?? 2000}
                  onChange={handleChange}
                  placeholder="2000"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Tarifa mínima permitida: <strong className="text-emerald-700">$2.000 COP</strong>
              </p>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">Tarifa para el cliente:</span>
                <span className="text-lg font-black text-emerald-900">
                  ${Number(formData.tarifaDomicilio || 2000).toLocaleString('es-CO')} COP
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Esta tarifa se congelará de forma autoritativa en cada pedido al momento de su creación.
              </p>
            </div>
          </div>
        </Card>

        {/* Section 6: Bancolombia Payment */}
        <Card className="p-6 space-y-5">
          <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                6. Pagos por Transferencia Bancolombia
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Permite a tus clientes pagar vía transferencia a tu cuenta Bancolombia con comprobante obligatorio.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="bancolombiaActivo"
                checked={formData.bancolombiaActivo ?? false}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-2.5 text-xs font-bold text-gray-800">
                {formData.bancolombiaActivo ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>

          {formData.bancolombiaActivo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tipo de Cuenta <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="bancolombiaTipoCuenta"
                    value={formData.bancolombiaTipoCuenta || 'AHORROS'}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="AHORROS">Cuenta de Ahorros</option>
                    <option value="CORRIENTE">Cuenta Corriente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Número de Cuenta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bancolombiaNumeroCuenta"
                    required={formData.bancolombiaActivo}
                    value={formData.bancolombiaNumeroCuenta || ''}
                    onChange={handleChange}
                    placeholder="Ej. 123-456789-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nombre o Razón Social del Titular <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bancolombiaTitular"
                    required={formData.bancolombiaActivo}
                    value={formData.bancolombiaTitular || ''}
                    onChange={handleChange}
                    placeholder="Ej. Juan Pérez / Inversiones SAS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Documento del Titular (C.C. / NIT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bancolombiaDocTitular"
                    required={formData.bancolombiaActivo}
                    value={formData.bancolombiaDocTitular || ''}
                    onChange={handleChange}
                    placeholder="Ej. CC 1020304050 / NIT 901234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Verificación en Comercio:</strong> Cuando un cliente pague con Bancolombia, deberá subir obligatoriamente el comprobante. Deberás verificarlo y aprobarlo desde la lista de pedidos antes de poder despachar el pedido.
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Los pagos por Bancolombia están desactivados para este comercio. Actívalos si deseas recibir transferencias directas.
            </p>
          )}
        </Card>

        {/* Section 7: Publication Toggle */}
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
