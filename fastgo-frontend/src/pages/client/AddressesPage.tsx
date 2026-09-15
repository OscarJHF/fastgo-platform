import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase } from 'lucide-react';
import { direccionService } from '../../services/direccionService';
import { Direccion, DireccionRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { parseApiError } from '../../utils/errorHandler';

export const AddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<Direccion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<DireccionRequest>({
    alias: 'Casa',
    direccion: '',
    ciudad: 'Bogotá',
    departamento: 'Cundinamarca',
    codigoPostal: '110111',
    latitud: 4.6097,
    longitud: -74.0817,
    principal: true,
  });

  const { success, error: showError } = useToast();

  const loadAddresses = async () => {
    try {
      const data = await direccionService.listMyAddresses();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await direccionService.createAddress(formData);
      success('Dirección registrada exitosamente');
      setIsModalOpen(false);
      setFormData({
        alias: 'Casa',
        direccion: '',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigoPostal: '110111',
        latitud: 4.6097,
        longitud: -74.0817,
        principal: false,
      });
      await loadAddresses();
    } catch (err) {
      const parsed = parseApiError(err);
      showError(parsed.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetPrincipal = async (id: number) => {
    try {
      await direccionService.setPrincipal(id);
      success('Dirección principal actualizada');
      await loadAddresses();
    } catch (err) {
      showError('Error al marcar dirección como principal');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta dirección?')) return;
    try {
      await direccionService.deleteAddress(id);
      success('Dirección eliminada');
      await loadAddresses();
    } catch (err) {
      showError('No se pudo eliminar la dirección');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mis Direcciones</h1>
          <p className="text-xs text-gray-500">Gestiona tus puntos de entrega habituales</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Nueva Dirección
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-700">No tienes direcciones guardadas</p>
          <p className="text-xs text-gray-400 mt-1">Añade tu dirección para recibir tus domicilios</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                    {addr.alias.toLowerCase() === 'casa' ? <Home className="w-4 h-4 text-emerald-600" /> : <Briefcase className="w-4 h-4 text-gray-500" />}
                    {addr.alias}
                  </span>
                  {addr.principal ? (
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Principal
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrincipal(addr.id)}
                      className="text-xs text-gray-400 hover:text-black font-semibold"
                    >
                      Hacer principal
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">{addr.direccion}</p>
                <p className="text-xs text-gray-400">{addr.ciudad}, {addr.departamento || 'Colombia'}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                  title="Eliminar dirección"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nueva Dirección */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Dirección">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Alias"
            placeholder="Casa, Oficina, Apto..."
            value={formData.alias}
            onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
            required
          />
          <Input
            label="Dirección Completa"
            placeholder="Calle 72 # 10-34"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ciudad"
              value={formData.ciudad}
              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              required
            />
            <Input
              label="Departamento"
              value={formData.departamento}
              onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitud (-90 a 90)"
              type="number"
              step="0.000001"
              value={formData.latitud}
              onChange={(e) => setFormData({ ...formData, latitud: parseFloat(e.target.value) })}
            />
            <Input
              label="Longitud (-180 a 180)"
              type="number"
              step="0.000001"
              value={formData.longitud}
              onChange={(e) => setFormData({ ...formData, longitud: parseFloat(e.target.value) })}
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
            Guardar Dirección
          </Button>
        </form>
      </Modal>
    </div>
  );
};
