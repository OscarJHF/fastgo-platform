import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  ChevronDown,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  Building2,
  X,
} from 'lucide-react';
import { useMerchantStore } from '../../context/MerchantStoreContext';
import { commerceService } from '../../services/commerceService';
import { categoriaService } from '../../services/categoriaService';
import { Comercio, CategoriaComercio, ComercioRequest } from '../../types';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

export const StoreSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { stores, selectedStore, setSelectedStore, refreshStores, subscriptionConfig } = useMerchantStore();

  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoriaComercio[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newStoreData, setNewStoreData] = useState<ComercioRequest>({
    nombre: '',
    categoriaId: 1,
    descripcion: '',
    telefono: '',
    correo: '',
    direccion: '',
    ciudad: 'Bogotá',
    horaApertura: '08:00',
    horaCierre: '20:00',
    diasAtencion: 'Lunes a Domingo',
    tiempoPreparacionMin: 25,
    tarifaDomicilio: 2000,
    metodosPago: 'EFECTIVO, TARJETA, PSE, TRANSFERENCIA',
    activo: false,
  });

  const handleOpenModal = async () => {
    setIsOpenDropdown(false);
    setIsModalOpen(true);
    if (categories.length === 0) {
      setIsLoadingCategories(true);
      try {
        const cats = await categoriaService.listActiveCommerceCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setNewStoreData((prev) => ({ ...prev, categoriaId: cats[0].id }));
        }
      } catch (err) {
        console.error('Error cargando categorias:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreData.nombre || !newStoreData.direccion || !newStoreData.telefono || !newStoreData.correo) {
      showError('Por favor completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await commerceService.guardar(newStoreData);
      success('¡Nueva tienda creada! Se encuentra en estado PENDIENTE DE ACTIVACIÓN.');
      setIsModalOpen(false);
      const updatedList = await refreshStores();
      const matched = updatedList.find((s) => s.id === created.id);
      if (matched) {
        setSelectedStore(matched);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje || err?.message || 'Error al crear la tienda';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedStore && stores.length === 0) {
    return null;
  }

  const activationFee = subscriptionConfig?.additionalStoreActivationPrice ?? 50000;
  const monthlyFee = subscriptionConfig?.additionalStoreMonthlyPrice ?? 30000;

  const renderStatusBadge = (store: Comercio) => {
    switch (store.estado) {
      case 'ACTIVA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ACTIVA
          </span>
        );
      case 'PENDIENTE_ACTIVACION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            PENDIENTE ACTIVACIÓN
          </span>
        );
      case 'PENDIENTE_PAGO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-300">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            PENDIENTE PAGO
          </span>
        );
      case 'SUSPENDIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            SUSPENDIDA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gray-100 text-gray-800">
            {store.estado || 'INACTIVA'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tienda Activa:</span>
              <span className="font-black text-gray-900 truncate">
                {selectedStore?.nombre || 'Seleccionar Tienda'}
              </span>
              {selectedStore && renderStatusBadge(selectedStore)}
              {selectedStore?.esPrincipal && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                  Principal (6m gratis)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {selectedStore?.direccion || 'Sin dirección'} • {selectedStore?.ciudad || 'Bogotá'}
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          {/* Dropdown selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpenDropdown(!isOpenDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-black text-gray-700 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-purple-600" />
              <span>Mis Tiendas ({stores.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isOpenDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tus Comercios</p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStore(s);
                        setIsOpenDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-purple-50/60 transition-colors ${
                        selectedStore?.id === s.id ? 'bg-purple-50 font-bold border-l-4 border-l-purple-600' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{s.nombre}</p>
                        <p className="text-[10px] text-gray-500 truncate">{s.direccion || 'Sin dirección'}</p>
                      </div>
                      <div className="shrink-0">{renderStatusBadge(s)}</div>
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear Tienda Adicional
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Nueva Tienda
          </Button>
        </div>
      </div>

      {/* Warning banner when active store is not ACTIVA */}
      {selectedStore && selectedStore.estado !== 'ACTIVA' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900">
            <p className="font-black text-sm">
              Tienda {selectedStore.estado === 'PENDIENTE_ACTIVACION' ? 'Pendiente de Activación' : selectedStore.estado}
            </p>
            <p className="leading-relaxed">
              {selectedStore.estado === 'PENDIENTE_ACTIVACION'
                ? 'Esta tienda ha sido registrada y está esperando aprobación por parte de la administración de FASTGO. Puedes configurar su catálogo, horarios e información. No estará visible para clientes ni recibirá pedidos hasta ser activada.'
                : selectedStore.estado === 'SUSPENDIDA'
                ? 'Esta tienda ha sido suspendida temporalmente por la administración. Comunícate con soporte para más información.'
                : 'La tienda requiere atención administrativa para quedar plenamente operativa.'}
            </p>
          </div>
        </div>
      )}

      {/* Modal Crear Tienda Adicional */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Tienda / Sede"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateStore} className="space-y-4">
          {/* Subscription Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider">
                Condiciones para Tiendas Adicionales
              </h4>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
              Tu cuenta ya cuenta con tu tienda principal. Para sedes o tiendas adicionales aplica una tarifa de activación de{' '}
              <strong>{formatCurrency(activationFee)}</strong> y una mensualidad de{' '}
              <strong>{formatCurrency(monthlyFee)}</strong>.
            </p>
            <div className="p-2.5 bg-white/80 rounded-xl border border-purple-200/60 text-[11px] text-gray-700">
              📌 <strong>Importante:</strong> La nueva tienda nacerá en estado{' '}
              <span className="font-bold text-amber-700">PENDIENTE DE ACTIVACIÓN</span>. El equipo de administración revisará la
              información y la habilitará para empezar a recibir pedidos.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Tienda *</label>
              <Input
                value={newStoreData.nombre}
                onChange={(e) => setNewStoreData({ ...newStoreData, nombre: e.target.value })}
                placeholder="Ej. Mi Negocio - Sede Norte"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Categoría de Comercio *</label>
              <select
                value={newStoreData.categoriaId}
                onChange={(e) => setNewStoreData({ ...newStoreData, categoriaId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isLoadingCategories}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono de Contacto *</label>
              <Input
                value={newStoreData.telefono}
                onChange={(e) => setNewStoreData({ ...newStoreData, telefono: e.target.value })}
                placeholder="Ej. 3101234567"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Correo de la Tienda *</label>
              <Input
                type="email"
                value={newStoreData.correo}
                onChange={(e) => setNewStoreData({ ...newStoreData, correo: e.target.value })}
                placeholder="Ej. sedenorte@minegocio.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dirección de Recogida *</label>
              <Input
                value={newStoreData.direccion}
                onChange={(e) => setNewStoreData({ ...newStoreData, direccion: e.target.value })}
                placeholder="Ej. Carrera 15 # 85-30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ciudad *</label>
              <Input
                value={newStoreData.ciudad}
                onChange={(e) => setNewStoreData({ ...newStoreData, ciudad: e.target.value })}
                placeholder="Bogotá"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Horario Apertura</label>
              <Input
                type="time"
                value={newStoreData.horaApertura}
                onChange={(e) => setNewStoreData({ ...newStoreData, horaApertura: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Horario Cierre</label>
              <Input
                type="time"
                value={newStoreData.horaCierre}
                onChange={(e) => setNewStoreData({ ...newStoreData, horaCierre: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Descripción corta</label>
            <textarea
              value={newStoreData.descripcion || ''}
              onChange={(e) => setNewStoreData({ ...newStoreData, descripcion: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Especialidades, productos destacados o indicaciones especiales..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              icon={isSubmitting ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
            >
              {isSubmitting ? 'Creando tienda...' : 'Crear Tienda'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
