import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { categoriaService } from '../../services/categoriaService';
import { CategoriaProducto } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { APP_ROUTES } from '../../constants/routes';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
    activo: true,
  });

  const { success, error: showError } = useToast();

  const loadCats = async () => {
    try {
      const data = await categoriaService.listProductCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await categoriaService.createProductCategory(formData);
      success('Categoría creada exitosamente');
      setIsModalOpen(false);
      setFormData({ nombre: '', descripcion: '', icono: '', activo: true });
      await loadCats();
    } catch (err) {
      showError('Error al crear la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoriaService.deleteProductCategory(id);
      success('Categoría eliminada');
      await loadCats();
    } catch (err) {
      showError('No se pudo eliminar la categoría');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={APP_ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel de administración
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categorías de Producto</h1>
          <p className="text-xs text-gray-500">Gestiona las clasificaciones de productos para los menús</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900">{c.nombre}</h4>
              <p className="text-xs text-gray-400">{c.descripcion || 'Sin descripción'}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
              title="Eliminar categoría"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Categoría de Producto">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nombre de la Categoría"
            placeholder="Postres y Bebidas"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Descripción"
            placeholder="Dulces, tortas, gaseosas..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
            Guardar Categoría
          </Button>
        </form>
      </Modal>
    </div>
  );
};
