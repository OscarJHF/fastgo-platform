import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, ArrowLeft, Store, Sparkles } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { Comercio, Sucursal, SucursalRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { APP_ROUTES } from '../../constants/routes';

export const CommerceBranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [ownCommerce, setOwnCommerce] = useState<Comercio | null>(null);
  const [commerceId, setCommerceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<SucursalRequest>({
    comercioId: 1,
    nombre: '',
    direccion: '',
    ciudad: 'Bogotá',
    abierta: true,
  });

  const { success, error: showError } = useToast();

  const loadBranches = async () => {
    try {
      let com: Comercio | null = null;
      try {
        com = await commerceService.getPropio();
      } catch {
        com = null;
      }

      setOwnCommerce(com);
      if (com) {
        setCommerceId(com.id);
        setFormData((prev) => ({ ...prev, comercioId: com.id }));
        const sucs = await sucursalService.listByCommerce(com.id);
        setBranches(sucs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commerceId) return;
    setIsSaving(true);
    try {
      await sucursalService.createSucursal(formData);
      success('Sucursal creada exitosamente');
      setIsModalOpen(false);
      setFormData({
        comercioId: commerceId,
        nombre: '',
        direccion: '',
        ciudad: 'Bogotá',
        abierta: true,
      });
      await loadBranches();
    } catch (err) {
      showError('No se pudo crear la sucursal');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ownCommerce) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Primero configura tu tienda</h2>
        <p className="text-sm text-gray-600">
          Antes de administrar sedes o sucursales, debes crear el perfil de tu comercio en FASTGO.
        </p>
        <div className="pt-2">
          <Link to={APP_ROUTES.COMMERCE_STORE}>
            <Button variant="primary" icon={<Sparkles className="w-4 h-4" />}>
              Configurar Mi Tienda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={APP_ROUTES.COMMERCE_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de comercio
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Sedes y Sucursales — {ownCommerce.nombre}</h1>
          <p className="text-xs text-gray-500">Puntos de atención, despacho y preparación de pedidos</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Nueva Sucursal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {branches.map((b) => (
          <Card key={b.id} className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-gray-900">{b.nombre}</h3>
                <Badge variant={b.abierta ? 'success' : 'danger'}>{b.abierta ? 'Abierta' : 'Cerrada'}</Badge>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {b.direccion}, {b.ciudad}
              </p>
              {b.radioEntregaKm && (
                <p className="text-[11px] text-gray-400">Radio de entrega: {b.radioEntregaKm} km</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nueva Sede / Sucursal">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nombre de la Sucursal"
            placeholder="Ej. Sede Norte, Punto Centro..."
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Dirección Física"
            placeholder="Ej. Cra 15 # 85-30"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            required
          />
          <Input
            label="Ciudad"
            placeholder="Bogotá"
            value={formData.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            required
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
            Guardar Sede
          </Button>
        </form>
      </Modal>
    </div>
  );
};
