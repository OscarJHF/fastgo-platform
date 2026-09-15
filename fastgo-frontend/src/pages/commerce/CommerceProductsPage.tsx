import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Plus, Trash2, Edit2, ArrowLeft, CheckCircle } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { Producto, Sucursal, CategoriaProducto, ProductoRequest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { APP_ROUTES } from '../../constants/routes';

export const CommerceProductsPage: React.FC = () => {
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ProductoRequest>({
    sucursalId: 0,
    categoriaId: 1,
    nombre: '',
    descripcion: '',
    precio: 15000,
    tiempoPreparacion: 20,
    imagenPrincipal: '',
    disponible: true,
    destacado: false,
  });

  const { success, error: showError } = useToast();

  const loadData = async () => {
    try {
      const commerces = await commerceService.listCommerces();
      const cats = await categoriaService.listActiveProductCategories();
      setCategories(cats);

      if (commerces.length > 0) {
        const sucs = await sucursalService.listByCommerce(commerces[0].id);
        setBranches(sucs);
        if (sucs.length > 0) {
          const branchId = selectedBranchId || sucs[0].id;
          setSelectedBranchId(branchId);
          setFormData((prev) => ({ ...prev, sucursalId: branchId, categoriaId: cats[0]?.id || 1 }));
          const prods = await productoService.listBySucursal(branchId);
          setProducts(prods);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) return;
    setIsSaving(true);
    try {
      await productoService.createProduct({
        ...formData,
        sucursalId: selectedBranchId,
      });
      success('Producto creado con éxito');
      setIsModalOpen(false);
      setFormData({
        sucursalId: selectedBranchId,
        categoriaId: categories[0]?.id || 1,
        nombre: '',
        descripcion: '',
        precio: 15000,
        tiempoPreparacion: 20,
        imagenPrincipal: '',
        disponible: true,
        destacado: false,
      });
      const prods = await productoService.listBySucursal(selectedBranchId);
      setProducts(prods);
    } catch (err) {
      showError('Error al crear producto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;
    try {
      await productoService.deleteProduct(id);
      success('Producto eliminado');
      if (selectedBranchId) {
        const prods = await productoService.listBySucursal(selectedBranchId);
        setProducts(prods);
      }
    } catch (err) {
      showError('No se pudo eliminar el producto');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={APP_ROUTES.COMMERCE_DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Catálogo de Productos</h1>
          <p className="text-xs text-gray-500">Administra los platos y productos de tu menú</p>
        </div>

        <div className="flex gap-2">
          {branches.length > 0 && (
            <select
              value={selectedBranchId || ''}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="bg-white border border-gray-200 text-xs font-bold rounded-xl px-3 py-2"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.nombre}
                </option>
              ))}
            </select>
          )}

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prod) => (
          <Card key={prod.id} className="p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-32 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-gray-400">
                {prod.imagenPrincipal ? (
                  <img src={prod.imagenPrincipal} alt={prod.nombre} className="w-full h-full object-cover" />
                ) : (
                  <Utensils className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{prod.nombre}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{prod.descripcion || 'Sin descripción'}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="font-black text-sm text-gray-900">{formatCurrency(prod.precio)}</span>
                <Badge variant={prod.disponible ? 'success' : 'danger'}>
                  {prod.disponible ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 mt-3 flex justify-end">
              <button
                onClick={() => handleDelete(prod.id)}
                className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                title="Eliminar producto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Nuevo Producto */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Producto al Menú">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nombre del Producto"
            placeholder="Hamburguesa Clásica"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Descripción"
            placeholder="Carne 150g, queso cheddar, pan artesanal..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio (COP)"
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
              required
            />
            <Input
              label="Tiempo Preparación (Minutos)"
              type="number"
              value={formData.tiempoPreparacion}
              onChange={(e) => setFormData({ ...formData, tiempoPreparacion: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Categoría</label>
            <select
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="URL de Imagen (Opcional)"
            placeholder="https://..."
            value={formData.imagenPrincipal}
            onChange={(e) => setFormData({ ...formData, imagenPrincipal: e.target.value })}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
            Guardar Producto
          </Button>
        </form>
      </Modal>
    </div>
  );
};
