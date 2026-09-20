import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  FolderPlus,
  Store,
  Sparkles,
  Search,
} from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { apiClient } from '../../api/apiClient';
import { Producto, Sucursal, CategoriaProducto, ProductoRequest, Comercio } from '../../types';
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
  const { success, error: showError } = useToast();

  const [ownCommerce, setOwnCommerce] = useState<Comercio | null>(null);
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Crear / Editar Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Nueva Categoría
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Filtro de búsqueda
  const [searchFilter, setSearchFilter] = useState('');

  const [formData, setFormData] = useState<ProductoRequest>({
    sucursalId: 0,
    categoriaId: 1,
    nombre: '',
    descripcion: '',
    precio: 15000,
    tiempoPreparacion: 15,
    imagenPrincipal: '',
    disponible: true,
    destacado: false,
    stock: 50,
  });

  const loadData = async () => {
    try {
      let com: Comercio | null = null;
      try {
        com = await commerceService.getPropio();
      } catch {
        com = null;
      }

      setOwnCommerce(com);

      const cats = await categoriaService.listActiveProductCategories().catch(() => []);
      setCategories(cats);

      if (com) {
        const sucs = await sucursalService.listByCommerce(com.id).catch(() => []);
        setBranches(sucs);
        if (sucs.length > 0) {
          const branchId = selectedBranchId || sucs[0].id;
          setSelectedBranchId(branchId);
          setFormData((prev) => ({
            ...prev,
            sucursalId: branchId,
            categoriaId: prev.categoriaId || cats[0]?.id || 1,
          }));
          const prods = await productoService.listBySucursal(branchId);
          setProducts(prods);
        }
      }
    } catch (err) {
      console.error('Error cargando catálogo de productos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormData({
      sucursalId: selectedBranchId || (branches[0]?.id || 0),
      categoriaId: categories[0]?.id || 1,
      nombre: '',
      descripcion: '',
      precio: 15000,
      tiempoPreparacion: 15,
      imagenPrincipal: '',
      disponible: true,
      destacado: false,
      stock: 50,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Producto) => {
    setEditingProductId(prod.id);
    setFormData({
      sucursalId: prod.sucursalId,
      categoriaId: prod.categoriaId,
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      tiempoPreparacion: prod.tiempoPreparacion || 15,
      imagenPrincipal: prod.imagenPrincipal || '',
      disponible: prod.disponible,
      destacado: prod.destacado || false,
      stock: prod.stock != null ? prod.stock : 50,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      showError('El nombre del producto es obligatorio');
      return;
    }
    if (!formData.precio || formData.precio <= 0) {
      showError('El precio debe ser mayor a cero');
      return;
    }

    const branchId = selectedBranchId || branches[0]?.id || 0;
    setIsSaving(true);
    try {
      if (editingProductId) {
        await productoService.updateProduct(editingProductId, {
          ...formData,
          sucursalId: branchId,
        });
        success('¡Producto actualizado exitosamente!');
      } else {
        await productoService.createProduct({
          ...formData,
          sucursalId: branchId,
        });
        success('¡Producto agregado al catálogo!');
      }
      setIsModalOpen(false);

      if (branchId) {
        const prods = await productoService.listBySucursal(branchId);
        setProducts(prods);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al guardar producto';
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      showError('El nombre de la categoría es obligatorio');
      return;
    }
    setIsCreatingCategory(true);
    try {
      const resp = await apiClient.post<CategoriaProducto>('/api/categorias-producto', {
        nombre: newCategoryName.trim(),
        descripcion: newCategoryDesc.trim() || undefined,
        activo: true,
      });
      const created = resp.data;
      success(`Categoría "${created.nombre}" creada con éxito`);
      setCategories((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, categoriaId: created.id }));
      setNewCategoryName('');
      setNewCategoryDesc('');
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al crear la categoría';
      showError(msg);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleToggleDisponibilidad = async (prod: Producto) => {
    try {
      const nuevo = !prod.disponible;
      await productoService.cambiarDisponibilidad(prod.id, nuevo);
      success(`Producto marcado como ${nuevo ? 'DISPONIBLE' : 'AGOTADO'}`);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, disponible: nuevo } : p))
      );
    } catch {
      showError('Error al cambiar la disponibilidad del producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto permanentemente de tu catálogo?')) return;
    try {
      await productoService.deleteProduct(id);
      success('Producto eliminado del catálogo');
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando catálogo comercial...</p>
      </div>
    );
  }

  // Si no tiene tienda configurada
  if (!ownCommerce) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Primero configura tu tienda</h2>
        <p className="text-sm text-gray-600">
          Antes de agregar productos, debes crear y configurar el perfil de tu comercio en FASTGO.
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

  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <Link
        to={APP_ROUTES.COMMERCE_DASHBOARD}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al panel
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Catálogo de Productos — {ownCommerce.nombre}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Agrega y administra los artículos de tu tienda (aplica a restaurantes, ropa, fruver, tecnología, supermercado, farmacia, etc.).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {branches.length > 1 && (
            <select
              value={selectedBranchId || ''}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="bg-white border border-gray-200 text-xs font-bold rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.nombre}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
            icon={<FolderPlus className="w-4 h-4" />}
          >
            Nueva Categoría
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            icon={<Plus className="w-4 h-4" />}
          >
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Search Filter Bar */}
      {products.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o descripción..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              {searchFilter ? 'No se encontraron productos con esa búsqueda' : 'No tienes productos en tu catálogo aún'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchFilter
                ? 'Prueba con otro término de búsqueda.'
                : 'Empieza agregando tu primer producto para que los clientes puedan verlo y comprarlo en FASTGO.'}
            </p>
          </div>
          {!searchFilter && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
              Agregar Mi Primer Producto
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <Card key={prod.id} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="h-36 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-gray-400">
                  {prod.imagenPrincipal ? (
                    <img
                      src={prod.imagenPrincipal}
                      alt={prod.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-gray-900 line-clamp-1">{prod.nombre}</h3>
                  <span className="font-black text-sm text-gray-900 shrink-0">
                    {formatCurrency(prod.precio)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2">{prod.descripcion || 'Sin descripción'}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-gray-500">
                    Stock: {prod.stock != null ? prod.stock : 'Ilimitado'} • Prep: ~{prod.tiempoPreparacion || 15}m
                  </span>
                  <Badge variant={prod.disponible ? 'success' : 'danger'}>
                    {prod.disponible ? 'Disponible' : 'Agotado'}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleDisponibilidad(prod)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                      prod.disponible
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {prod.disponible ? 'Agotar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(prod)}
                    className="p-1.5 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    title="Editar producto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(prod.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProductId ? 'Editar Producto' : 'Agregar Producto al Catálogo'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Input
            label="Nombre del Producto"
            placeholder="Ej. Hamburguesa Especial, Camiseta Negra L, Kilo de Manzanas, Audífonos Bluetooth..."
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Descripción del Producto
            </label>
            <textarea
              rows={2}
              placeholder="Detalla características, ingredientes, tallas, peso o especificaciones..."
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Precio (COP)"
              type="number"
              min={100}
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Alistamiento (Min)"
              type="number"
              min={1}
              value={formData.tiempoPreparacion || 15}
              onChange={(e) => setFormData({ ...formData, tiempoPreparacion: parseInt(e.target.value) || 15 })}
            />
            <Input
              label="Stock Disponible"
              type="number"
              min={0}
              placeholder="Ej. 50"
              value={formData.stock !== undefined ? formData.stock : 50}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Categoría</label>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsCategoryModalOpen(true);
                }}
                className="text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                + Crear nueva
              </button>
            </div>
            <select
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: parseInt(e.target.value) })}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            placeholder="https://ejemplo.com/producto.jpg"
            value={formData.imagenPrincipal || ''}
            onChange={(e) => setFormData({ ...formData, imagenPrincipal: e.target.value })}
          />

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={formData.disponible ?? true}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Disponible para la venta
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={formData.destacado ?? false}
                onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              Destacar en la tienda
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
            {editingProductId ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </form>
      </Modal>

      {/* Modal Nueva Categoría */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Crear Nueva Categoría de Producto"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Nombre de la Categoría"
            placeholder="Ej. Ropa de Mujer, Bebidas, Frutas, Accesorios, Medicamentos..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
          <Input
            label="Descripción (Opcional)"
            placeholder="Breve descripción de esta categoría..."
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isCreatingCategory}>
            Crear Categoría
          </Button>
        </form>
      </Modal>
    </div>
  );
};
