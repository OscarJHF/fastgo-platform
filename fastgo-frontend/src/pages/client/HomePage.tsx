import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Search,
  Store,
  Sparkles,
  MapPin,
  ChevronRight,
  Package,
  Bike,
  ArrowRight,
  LogIn,
  UserPlus,
  Star,
} from 'lucide-react';
import { commerceService } from '../../services/commerceService';
import { categoriaService } from '../../services/categoriaService';
import { geografiaService } from '../../services/geografiaService';
import { analyticsService } from '../../services/analyticsService';
import { Comercio, CategoriaComercio, Departamento, Municipio } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { APP_ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [commerces, setCommerces] = useState<Comercio[]>([]);
  const [categories, setCategories] = useState<CategoriaComercio[]>([]);
  const [featuredCommerces, setFeaturedCommerces] = useState<Comercio[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filtros geográficos oficiales DANE
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('');

  useEffect(() => {
    // Registrar analítica de visita pública/cliente
    analyticsService.track({
      eventType: 'PAGE_VIEW',
      platform: 'WEB',
      pathOrScreen: '/',
    });

    // Cargar catálogo de departamentos DANE
    geografiaService.getDepartamentos()
      .then(setDepartamentos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDepartamento) {
      geografiaService.getMunicipiosPorDepartamento(selectedDepartamento)
        .then(setMunicipios)
        .catch(() => setMunicipios([]));
    } else {
      setMunicipios([]);
    }
    setSelectedMunicipio('');
  }, [selectedDepartamento]);

  useEffect(() => {
    if (isAuthenticated && (!user?.rol || user.rol === 'CLIENTE')) {
      const loadInitialData = async () => {
        setIsLoading(true);
        try {
          const params: Record<string, any> = {};
          if (selectedDepartamento) params.departamentoId = selectedDepartamento;
          if (selectedMunicipio) params.municipioId = selectedMunicipio;
          if (selectedCategory) params.categoriaId = selectedCategory;

          const [commercesData, categoriesData, featuredData] = await Promise.all([
            commerceService.listCommerces(params),
            categoriaService.listActiveCommerceCategories(),
            commerceService.listFeaturedCommerces({
              departamentoId: selectedDepartamento || undefined,
              municipioId: selectedMunicipio || undefined,
            }),
          ]);
          setCommerces(commercesData);
          setCategories(categoriesData);
          setFeaturedCommerces(featuredData);
        } catch (err) {
          console.error('Error cargando catálogo:', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadInitialData();
    }
  }, [isAuthenticated, user?.rol, selectedDepartamento, selectedMunicipio, selectedCategory]);

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-semibold">Cargando FASTGO...</p>
      </div>
    );
  }

  // Redirecciones por rol para no-clientes autenticados
  if (isAuthenticated && user?.rol === 'COMERCIO') {
    return <Navigate to={APP_ROUTES.COMMERCE_DASHBOARD} replace />;
  }
  if (isAuthenticated && user?.rol === 'DOMICILIARIO') {
    return <Navigate to={APP_ROUTES.DELIVERY_DASHBOARD} replace />;
  }
  if (isAuthenticated && user?.rol === 'ADMIN') {
    return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;
  }

  // =========================================================================
  // VISTA VISITANTE SIN SESIÓN: LANDING PÚBLICA OFICIAL
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="space-y-12 max-w-full overflow-hidden pb-12">
        {/* Hero Banner Oficial para Visitantes */}
        <section className="relative rounded-3xl bg-slate-900 p-8 sm:p-14 text-white overflow-hidden shadow-2xl border border-slate-800">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
            style={{ backgroundImage: "url('/assets/images/login-fondo.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-emerald-950/80" />

          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> FASTGO Colombia
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Cerca de ti en cada pedido
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              La plataforma integral para pedir en restaurantes y comercios aliados, enviar encomiendas urbanas inmediatas y conectar con el comercio local con total rapidez y seguridad.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link to={APP_ROUTES.REGISTER}>
                <Button variant="primary" size="lg" icon={<UserPlus className="w-4 h-4" />}>
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link to={APP_ROUTES.LOGIN}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  icon={<LogIn className="w-4 h-4" />}
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Presentación de los 3 Servicios Principales FASTGO */}
        <section className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-2xl font-black text-gray-900">Nuestros Servicios</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Soluciones hiperlocales diseñadas para clientes, comercios y repartidores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 flex flex-col justify-between hover:shadow-lg transition-shadow border-emerald-100">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Restaurantes y Tiendas</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pide platos deliciosos, víveres, ropa, fruver, tecnología y farmacia de negocios locales con despacho exprés a tu puerta.
                </p>
              </div>
              <Link
                to={APP_ROUTES.LOGIN}
                className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 gap-1 pt-2"
              >
                Inicia sesión para pedir <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            <Card className="p-6 space-y-4 flex flex-col justify-between hover:shadow-lg transition-shadow border-slate-200">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-sm">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Encomiendas Urbanas</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Envíos punto a punto para documentos, llaves o paquetes. Tarifa oficial desde $2.000 COP calculada en tiempo real.
                </p>
              </div>
              <Link
                to={APP_ROUTES.LOGIN}
                className="inline-flex items-center text-xs font-bold text-slate-800 hover:text-emerald-700 gap-1 pt-2"
              >
                Solicitar mensajero <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            <Card className="p-6 space-y-4 flex flex-col justify-between hover:shadow-lg transition-shadow border-purple-100">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm">
                  <Bike className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Red de Domiciliarios</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Repartidores verificados con rastreo GPS en vivo, confirmación de entrega y pagos garantizados en cada pedido.
                </p>
              </div>
              <Link
                to={`${APP_ROUTES.REGISTER}?rol=DOMICILIARIO`}
                className="inline-flex items-center text-xs font-bold text-purple-700 hover:text-purple-800 gap-1 pt-2"
              >
                Únete a la red <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </div>
        </section>

        {/* Sección: ¿Cómo funciona FASTGO? */}
        <section className="bg-gradient-to-br from-emerald-50/60 to-slate-50 p-8 sm:p-10 rounded-3xl border border-emerald-100/80 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Sencillo y Seguro
            </span>
            <h2 className="text-2xl font-black text-gray-900 pt-2">¿Cómo funciona FASTGO?</h2>
            <p className="text-xs text-gray-500">Todo lo que necesitas en 3 sencillos pasos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-base text-gray-900">Crea tu cuenta o inicia sesión</h4>
              <p className="text-xs text-gray-500">
                Regístrate en segundos como Cliente, Comercio o Repartidor. Accede a tu área correspondiente.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-base text-gray-900">Elige tu comercio o encargo</h4>
              <p className="text-xs text-gray-500">
                Explora el catálogo comercial de tu ciudad o solicita tu encomienda urbana con tarifa justa.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-base text-gray-900">Recibe en tu puerta</h4>
              <p className="text-xs text-gray-500">
                Sigue la entrega en tiempo real. Paga en efectivo, datáfono o PSE de forma protegida.
              </p>
            </div>
          </div>
        </section>

        {/* Ecosistema FASTGO Partner Cards */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Haz parte del ecosistema FASTGO</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Opciones especializadas para hacer crecer tu negocio o generar ingresos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Vende más y llega a miles de clientes locales. Configura tu catálogo multisector, horarios y cocina en tiempo real.
                </p>
              </div>
              <Link
                to={`${APP_ROUTES.REGISTER}?rol=COMERCIO`}
                className="mt-5 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Comenzar como Comercio →
              </Link>
            </div>

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
                  Genera ingresos con flexibilidad total. Panel optimizado para aceptar despachos de comercios y encomiendas.
                </p>
              </div>
              <Link
                to={`${APP_ROUTES.REGISTER}?rol=DOMICILIARIO`}
                className="mt-5 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Quiero Repartir →
              </Link>
            </div>

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
                  ¿Necesitas enviar documentos o paquetería urgente? Servicio de mensajería urbana puerta a puerta garantizado.
                </p>
              </div>
              <Link
                to={APP_ROUTES.LOGIN}
                className="mt-5 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Solicitar Mensajero →
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // VISTA CLIENTE AUTENTICADO: CATÁLOGO COMERCIAL COMPLETO
  // =========================================================================
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

          {/* Search Bar con Lupa Clickeable y Enter Submit */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const resultsSection = document.getElementById('seccion-comercios');
              if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="pt-2 flex items-center max-w-lg"
          >
            <div className="relative w-full flex items-center">
              <button
                type="submit"
                aria-label="Buscar restaurantes, tiendas o productos"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer z-10"
              >
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="🔍 Buscar restaurantes, tiendas o comercios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/40 shadow-lg border border-gray-100"
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Selector Geográfico DANE Colombia */}
          <div className="pt-1 flex flex-wrap items-center gap-2 max-w-lg">
            <div className="flex-1 min-w-[150px]">
              <select
                aria-label="Seleccionar Departamento"
                value={selectedDepartamento}
                onChange={(e) => setSelectedDepartamento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/90 text-white text-xs font-medium border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="">🇨🇴 Todo Colombia (Departamentos)</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            {selectedDepartamento && (
              <div className="flex-1 min-w-[150px]">
                <select
                  aria-label="Seleccionar Municipio"
                  value={selectedMunicipio}
                  onChange={(e) => setSelectedMunicipio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/90 text-white text-xs font-medium border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
                >
                  <option value="">Todos los municipios</option>
                  {municipios.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Servicios Principales FastGo */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-200/60 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-all">
          <div className="space-y-1 max-w-[75%]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Comercios Locales
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-1">Pedir en Restaurantes y Tiendas</h2>
            <p className="text-xs text-gray-600">Explora platos, bebidas y productos de comercios aliados.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <Link
          to={APP_ROUTES.ENCOMIENDAS}
          className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between group hover:shadow-xl hover:ring-2 hover:ring-emerald-500/50 transition-all border border-slate-700"
        >
          <div className="space-y-1 max-w-[75%]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                Nuevo Servicio
              </span>
              <span className="text-[11px] font-bold text-slate-300">Desde $2.000 COP</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Enviar una Encomienda</h2>
            <p className="text-xs text-slate-300">Envíos urbanos exprés de paquetes, documentos y encargos.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform font-black">
            <ArrowRight className="w-6 h-6" />
          </div>
        </Link>
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

      {/* Featured Stores (Tiendas Destacadas del Banner Principal autorizadas por ADMIN) */}
      {featuredCommerces.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" /> Comercios Destacados
            </h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
              Selección Oficial FASTGO
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCommerces.map((c) => (
              <Link
                key={c.id}
                to={`/comercio/${c.id}`}
                className="group block rounded-3xl bg-white border border-gray-100 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {c.banner ? (
                    <img
                      src={c.banner}
                      alt={c.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-slate-100 flex items-center justify-center">
                      <Store className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md">
                    ⭐ Destacado
                  </span>
                  <div className="absolute bottom-3 left-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md overflow-hidden border border-white/50 shrink-0">
                      {c.logo ? (
                        <img src={c.logo} alt={c.nombre} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center font-black text-slate-700">
                          {c.nombre.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-white drop-shadow-md">
                      <h3 className="font-black text-base leading-tight group-hover:text-amber-300 transition-colors">
                        {c.nombre}
                      </h3>
                      <p className="text-xs text-white/90 line-clamp-1">
                        {c.categoria || 'Comercio Aliado'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {c.descripcion || 'Descubre los mejores productos y platos preparados de este comercio aliado.'}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                    <span className="font-bold text-emerald-600">
                      🛵 Domicilio: {formatCurrency(c.tarifaDomicilio || 2000)}
                    </span>
                    <span className="font-medium text-gray-400 flex items-center gap-1">
                      {c.tiempoPreparacionMin || 25}-{(c.tiempoPreparacionMin || 25) + 15} min
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Commerces Grid */}
      <section id="seccion-comercios" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-700" /> Comercios Disponibles
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
                        <Badge variant={commerce.pausaManual ? 'warning' : commerce.abierto !== false ? 'success' : 'danger'}>
                          {commerce.pausaManual ? 'Pausa' : commerce.abierto !== false ? 'Abierto' : 'Cerrado'}
                        </Badge>
                      </div>
                      {commerce.logo && (
                        <div className="absolute bottom-2 left-3 w-10 h-10 rounded-xl bg-white shadow-md overflow-hidden p-0.5 border border-gray-100">
                          <img src={commerce.logo} alt={commerce.nombre} className="w-full h-full object-cover rounded-lg" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {commerce.nombre}
                        </h3>
                        {commerce.categoria && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            {commerce.categoria}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {commerce.descripcion || 'Productos de alta calidad con entrega inmediata.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium flex items-center gap-1 truncate max-w-[60%]">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />{' '}
                      {commerce.direccion ? `${commerce.direccion}, ${commerce.ciudad || 'Bogotá'}` : 'Cobertura local'}
                    </span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Ver catálogo <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
