import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, Sparkles, MapPin, ChevronRight, Utensils, ShoppingCart } from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { categoriaService } from '../../services/categoriaService';
import { productoService } from '../../services/productoService';
import { Comercio, CategoriaComercio, Producto } from '../../types';
import { Card } from '../../components/common/Card';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { APP_ROUTES } from '../../constants/routes';

export const HomePage: React.FC = () => {
  const [commerces, setCommerces] = useState<Comercio[]>([]);
  const [categories, setCategories] = useState<CategoriaComercio[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [commercesData, categoriesData, featuredData] = await Promise.all([
          commerceService.listCommerces(),
          categoriaService.listActiveCommerceCategories(),
          productoService.listDestacados(),
        ]);
        setCommerces(commercesData);
        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
      } catch (err) {
        console.error('Error cargando catálogo:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const filteredCommerces = commerces.filter((c) => {
    const matchesSearch =
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory ? c.categoriaId === selectedCategory : true;
    return matchesSearch && matchesCat && c.activo;
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando los mejores comercios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-full overflow-hidden">
      {/* Hero Banner with Official Background */}
      <section className="relative rounded-3xl bg-slate-900 p-8 sm:p-12 text-white overflow-hidden shadow-xl max-w-full border border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{ backgroundImage: "url('/assets/images/login-fondo.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/70" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Entrega Inmediata
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Pide comida, víveres y más a tu puerta
          </h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Comercios aliados locales, seguimiento en tiempo real y pagos seguros garantizados.
          </p>

          {/* Search Bar */}
          <div className="pt-2 flex items-center max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="¿Qué se te antoja hoy? Busca restaurantes, platos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/40 shadow-lg border border-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Category Pills */}
      <section className="space-y-3 max-w-full overflow-hidden">
        <h2 className="text-lg font-black text-gray-900">Categorías de Comercio</h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Todas las Categorías
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Platos Destacados
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 4).map((p) => (
              <Card key={p.id} hoverable className="flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="h-36 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden">
                    {p.imagenPrincipal ? (
                      <img src={p.imagenPrincipal} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Utensils className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.nombre}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{p.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="pt-3 flex items-center justify-between border-t border-gray-50 mt-3">
                  <span className="font-black text-sm text-gray-900">{formatCurrency(p.precio)}</span>
                  <Badge variant="primary">Destacado</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Commerces Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" /> Comercios Disponibles ({filteredCommerces.length})
          </h2>
        </div>

        {filteredCommerces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-700">No encontramos comercios que coincidan</p>
            <p className="text-xs text-gray-400 mt-1">Prueba seleccionando otra categoría o término de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommerces.map((commerce) => (
              <Link key={commerce.id} to={`/comercio/${commerce.id}`}>
                <Card hoverable className="h-full flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="h-40 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                      {commerce.banner ? (
                        <img src={commerce.banner} alt={commerce.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-10 h-10 text-gray-300" />
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="success">Abierto</Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {commerce.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {commerce.descripcion || 'Especialistas en la mejor comida y productos locales.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> Cobertura local
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Ver menú <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Official FastGo Partner Programs */}
      <section className="pt-6 border-t border-gray-100 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Haz parte del ecosistema FASTGO</h2>
          <p className="text-sm text-gray-500 mt-1">Opciones y servicios especializados para potenciar tus ventas y entregas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Registra tu comercio */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden bg-emerald-50/50 flex items-center justify-center p-3 border border-emerald-100/50">
                <img 
                  src="/assets/images/registra-tu-comercio.png" 
                  alt="Registra tu comercio" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>
              <h3 className="text-lg font-black text-gray-900">Registra tu Comercio</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Vende más y llega a miles de clientes locales en tu ciudad. Gestiona tus sucursales, productos y pedidos con panel en tiempo real.
              </p>
            </div>
            <Link to={APP_ROUTES.REGISTER} className="mt-5 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
              Comenzar Ahora →
            </Link>
          </div>

          {/* Card 2: Únete como domiciliario */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden bg-emerald-50/50 flex items-center justify-center p-3 border border-emerald-100/50">
                <img 
                  src="/assets/images/Unirse-domiciliario.png" 
                  alt="Únete como domiciliario" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>
              <h3 className="text-lg font-black text-gray-900">Únete como Domiciliario</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Genera ingresos con flexibilidad total de horarios. App móvil optimizada con navegación GPS y pagos puntuales garantizados.
              </p>
            </div>
            <Link to={APP_ROUTES.REGISTER} className="mt-5 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
              Quiero Repartir →
            </Link>
          </div>

          {/* Card 3: Solicita un domiciliario */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden bg-emerald-50/50 flex items-center justify-center p-3 border border-emerald-100/50">
                <img 
                  src="/assets/images/solcita-un-domiciliario.png" 
                  alt="Solicita un domiciliario express" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>
              <h3 className="text-lg font-black text-gray-900">Envíos Corporativos Express</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                ¿Necesitas mandar llaves, documentos o paquetería urgente? Servicio de mensajería empresarial y personal puerta a puerta.
              </p>
            </div>
            <Link to={APP_ROUTES.REGISTER} className="mt-5 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
              Solicitar Mensajero →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
