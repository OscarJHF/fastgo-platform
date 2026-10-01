import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FastGoLogo } from '../common/FastGoLogo';
import { apiClient } from '../../api/apiClient';
import { APP_ROUTES } from '../../constants/routes';

export const Footer: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'degraded' | 'offline'>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        const res = await apiClient.get('/api/health', { timeout: 6000 });
        const elapsed = Math.round(performance.now() - startTime);
        if (isMounted) {
          if (res.status === 200) {
            setBackendStatus('online');
            setLatency(elapsed);
          } else {
            setBackendStatus('degraded');
          }
        }
      } catch {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <FastGoLogo size="sm" />
            <p className="text-sm text-gray-500 leading-relaxed">
              Cerca de ti en cada pedido. Tu comida y compras de supermercado favoritas en minutos con cobertura hiperlocal.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Descubre</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to={`${APP_ROUTES.HOME}?categoria=Restaurantes`} className="hover:text-black transition-colors">
                  Restaurantes
                </Link>
              </li>
              <li>
                <Link to={`${APP_ROUTES.HOME}?categoria=Supermercados`} className="hover:text-black transition-colors">
                  Supermercados
                </Link>
              </li>
              <li>
                <Link to={`${APP_ROUTES.HOME}?categoria=Farmacias`} className="hover:text-black transition-colors">
                  Farmacias
                </Link>
              </li>
              <li>
                <Link to={APP_ROUTES.ENCOMIENDAS} className="hover:text-black transition-colors">
                  Envíos Express
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Roles FastGo</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to={`${APP_ROUTES.LOGIN}?role=CLIENTE`} className="hover:text-black transition-colors">
                  Para Clientes
                </Link>
              </li>
              <li>
                <Link to={`${APP_ROUTES.REGISTER}?role=COMERCIO`} className="hover:text-black transition-colors">
                  Para Comercios Aliados
                </Link>
              </li>
              <li>
                <Link to={`${APP_ROUTES.REGISTER}?role=DOMICILIARIO`} className="hover:text-black transition-colors">
                  Para Repartidores / Domiciliarios
                </Link>
              </li>
              <li>
                <a href="mailto:soporte@fastgo.com.co" className="hover:text-black transition-colors">
                  Soporte y Seguridad
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Seguridad & Pagos</h4>
            <p className="text-xs text-gray-500 mb-3">
              Transacciones seguras mediante Wompi (Bancolombia, Nequi, PSE) y geolocalización protegida con Google Maps Platform.
            </p>
            {backendStatus === 'online' && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                API Backend ONLINE {latency !== null && `(${latency}ms)`}
              </div>
            )}
            {backendStatus === 'degraded' && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                API Backend DEGRADADO
              </div>
            )}
            {backendStatus === 'offline' && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                API Backend OFFLINE
              </div>
            )}
            {backendStatus === 'checking' && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                Verificando API Backend...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} FastGo Technologies Colombia. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0 font-medium">FastGo Beta 2 — Production Ready</p>
        </div>
      </div>
    </footer>
  );
};
