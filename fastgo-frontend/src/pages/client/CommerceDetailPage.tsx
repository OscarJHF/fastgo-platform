import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { sucursalService } from '../../services/sucursalService';
import { productoService } from '../../services/productoService';
import { categoriaService } from '../../services/categoriaService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Comercio, Sucursal, Producto, CategoriaProducto } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { APP_ROUTES } from '../../constants/routes';

export const CommerceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const commerceId = Number(id);

  const [commerce, setCommerce] = useState<Comercio | null>(null);
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Sucursal | null>(null);
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<CategoriaProducto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Cantidad seleccionada temporal por producto
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const { addItem, loadCartForBranch, itemCount, subtotal } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setIsLoading(false);
      return;
    }
    const loadCommerce = async () => {
      try {
        const [c, sucursales, cats] = await Promise.all([
          commerceService.getCommerce(commerceId),
          sucursalService.listByCommerce(commerceId),
          categoriaService.listActiveProductCategories().catch(() => []),
        ]);

        setCommerce(c);
        setBranches(sucursales);
        setCategories(cats);

        if (sucursales.length > 0) {
          const firstBranch = sucursales[0];
          setSelectedBranch(firstBranch);
          await loadBranchProducts(firstBranch.id);
          await loadCartForBranch(firstBranch.id);
        }
      } catch (err) {
        console.error('Error cargando comercio:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCommerce();
  }, [commerceId]);

  const loadBranchProducts = async (sucursalId: number) => {
    try {
      const prods = await productoService.listBySucursal(sucursalId);
      setProducts(prods);
    } catch (err) {
      console.error('Error cargando productos de sucursal:', err);
    }
  };

  const handleBranchChange = async (branchId: number) => {
    const branch = branches.find((b) => b.id === branchId) || null;
    setSelectedBranch(branch);
    if (branch) {
      setIsLoading(true);
      await loadBranchProducts(branch.id);
      await loadCartForBranch(branch.id);
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (prodId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[prodId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [prodId]: next };
    });
  };

  const handleAddToCart = async (producto: Producto) => {
    if (!selectedBranch) return;
    const qty = quantities[producto.id] || 1;
    try {
      await addItem(selectedBranch.id, producto, qty);
      success(`Se agregó ${qty}x ${producto.nombre} al carrito`);
      setQuantities((prev) => ({ ...prev, [producto.id]: 1 }));
    } catch (err) {
      error('No fue posible agregar el producto al carrito');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando catálogo y sucursales...</p>
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Comercio no encontrado</h2>
        <Link to={APP_ROUTES.HOME} className="mt-4 inline-block">
          <Button variant="primary">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to={APP_ROUTES.HOME} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Volver a comercios
      </Link>

      {/* Commerce Header Card with Banner and Logo */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        {commerce.banner && (
          <div className="h-44 sm:h-56 w-full bg-slate-100 overflow-hidden">
            <img src={commerce.banner} alt={commerce.nombre} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-md shadow-purple-600/20 shrink-0 overflow-hidden">
                {commerce.logo ? (
                  <img src={commerce.logo} alt={commerce.nombre} className="w-full h-full object-cover" />
                ) : (
                  commerce.nombre.charAt(0)
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{commerce.nombre}</h1>
                  {commerce.categoria && (
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {commerce.categoria}
                    </span>
                  )}
                  <Badge variant={commerce.pausaManual ? 'warning' : commerce.abierto !== false ? 'success' : 'danger'}>
                    {commerce.pausaManual ? 'Pausa Manual' : commerce.abierto !== false ? 'Abierto' : 'Cerrado'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {commerce.descripcion || 'Comercio aliado con entregas y pedidos inmediatos.'}
                </p>
              </div>
            </div>

            {/* Sucursales Selector */}
            {branches.length > 0 && (
              <div className="w-full sm:w-auto bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                  Punto de Despacho
                </label>
                <select
                  value={selectedBranch?.id || ''}
                  onChange={(e) => handleBranchChange(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      📍 {b.nombre} - {b.direccion} ({b.ciudad})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Selected Branch Details & Schedule */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-600">
            {selectedBranch && (
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-gray-400" /> {selectedBranch.direccion}, {selectedBranch.ciudad}
              </span>
            )}
            {selectedBranch?.telefono && (
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-gray-400" /> {selectedBranch.telefono}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-gray-400" /> Horario: {commerce.horaApertura || '08:00'} - {commerce.horaCierre || '20:00'}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              ⚡ Alistamiento: ~{commerce.tiempoPreparacionMin || 20} min
            </span>
          </div>
        </div>
      </div>

      {/* Closed / Paused Store Alert Banner */}
      {(!commerce.abierto || commerce.pausaManual) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-sm">Este comercio se encuentra actualmente cerrado</h4>
            <p className="text-xs text-rose-700 mt-1">
              {commerce.nombre} no está recibiendo pedidos en este momento.{' '}
              {commerce.pausaManual
                ? 'La tienda está pausada temporalmente.'
                : commerce.mensajeEstado ||
                  `Horario de atención: ${commerce.horaApertura || '08:00'} a ${commerce.horaCierre || '20:00'} (${commerce.diasAtencion || 'Todos los días'}).`}
            </p>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      {categories.length > 0 && products.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Todos ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.categoriaId === c.id).length;
            if (count === 0) return null; // No mostrar categorías sin productos de forma rota
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                  selectedCategory === c.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {c.nombre} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Catalog Products Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-800" /> Catálogo de Productos ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">Esta sede aún no tiene productos disponibles.</p>
          </div>
        ) : selectedCategory === 'ALL' ? (
          <div className="space-y-8">
            {categories.map((cat) => {
              const prodsInCat = products.filter((p) => p.categoriaId === cat.id);
              if (prodsInCat.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                      {cat.nombre} <span className="text-xs font-normal text-gray-500">({prodsInCat.length})</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prodsInCat.map((p) => {
                      const qty = quantities[p.id] || 1;
                      return (
                        <Card key={p.id} className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            <div className="h-44 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-gray-300">
                              {p.imagenPrincipal ? (
                                <img
                                  src={p.imagenPrincipal}
                                  alt={p.nombre}
                                  className="w-full h-full object-cover"
                                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                                />
                              ) : (
                                <Package className="w-10 h-10 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-extrabold text-base text-gray-900">{p.nombre}</h3>
                                <span className="font-black text-base text-gray-900 shrink-0">
                                  {formatCurrency(p.precio)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {p.descripcion || 'Producto disponible para entrega inmediata.'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                              <button
                                onClick={() => handleQuantityChange(p.id, -1)}
                                className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                                aria-label="Disminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold text-gray-900">{qty}</span>
                              <button
                                onClick={() => handleQuantityChange(p.id, 1)}
                                className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                                aria-label="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddToCart(p)}
                              icon={<ShoppingBag className="w-4 h-4" />}
                              disabled={!p.disponible || !commerce.abierto || commerce.pausaManual}
                            >
                              {!commerce.abierto || commerce.pausaManual ? 'Cerrado' : p.disponible ? 'Agregar' : 'Agotado'}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Productos sin categoría asignada */}
            {products.filter((p) => !categories.some((c) => c.id === p.categoriaId)).length > 0 && (
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
                    Otros Artículos
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter((p) => !categories.some((c) => c.id === p.categoriaId))
                    .map((p) => {
                      const qty = quantities[p.id] || 1;
                      return (
                        <Card key={p.id} className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            <div className="h-44 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-gray-300">
                              {p.imagenPrincipal ? (
                                <img
                                  src={p.imagenPrincipal}
                                  alt={p.nombre}
                                  className="w-full h-full object-cover"
                                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                                />
                              ) : (
                                <Package className="w-10 h-10 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-extrabold text-base text-gray-900">{p.nombre}</h3>
                                <span className="font-black text-base text-gray-900 shrink-0">
                                  {formatCurrency(p.precio)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {p.descripcion || 'Producto disponible para entrega inmediata.'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                              <button
                                onClick={() => handleQuantityChange(p.id, -1)}
                                className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                                aria-label="Disminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-bold text-gray-900">{qty}</span>
                              <button
                                onClick={() => handleQuantityChange(p.id, 1)}
                                className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                                aria-label="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddToCart(p)}
                              icon={<ShoppingBag className="w-4 h-4" />}
                              disabled={!p.disponible || !commerce.abierto || commerce.pausaManual}
                            >
                              {!commerce.abierto || commerce.pausaManual ? 'Cerrado' : p.disponible ? 'Agregar' : 'Agotado'}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter((p) => p.categoriaId === selectedCategory)
              .map((p) => {
                const qty = quantities[p.id] || 1;
                return (
                  <Card key={p.id} className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="h-44 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center text-gray-300">
                        {p.imagenPrincipal ? (
                          <img
                            src={p.imagenPrincipal}
                            alt={p.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                        ) : (
                          <Package className="w-10 h-10 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-base text-gray-900">{p.nombre}</h3>
                          <span className="font-black text-base text-gray-900 shrink-0">
                            {formatCurrency(p.precio)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {p.descripcion || 'Producto disponible para entrega inmediata.'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button
                          onClick={() => handleQuantityChange(p.id, -1)}
                          className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                          aria-label="Disminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900">{qty}</span>
                        <button
                          onClick={() => handleQuantityChange(p.id, 1)}
                          className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddToCart(p)}
                        icon={<ShoppingBag className="w-4 h-4" />}
                        disabled={!p.disponible || !commerce.abierto || commerce.pausaManual}
                      >
                        {!commerce.abierto || commerce.pausaManual ? 'Cerrado' : p.disponible ? 'Agregar' : 'Agotado'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </section>

      {/* Sticky Cart Summary if Items exist */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4">
          <Link
            to={APP_ROUTES.CART}
            className="flex items-center justify-between bg-black text-white p-4 rounded-2xl shadow-2xl hover:bg-gray-900 transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-xs">
                {itemCount}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tu Pedido</p>
                <p className="text-sm font-extrabold">{formatCurrency(subtotal)}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              Ver Carrito <ShoppingBag className="w-4 h-4" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};
