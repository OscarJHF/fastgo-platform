import React from 'react';
import { FastGoLogo } from '../common/FastGoLogo';

export const Footer: React.FC = () => {
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
              <li>Restaurantes</li>
              <li>Supermercados</li>
              <li>Farmacias</li>
              <li>Promociones y Destacados</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Roles FastGo</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Para Clientes</li>
              <li>Para Comercios Aliados</li>
              <li>Para Repartidores / Domiciliarios</li>
              <li>Soporte y Seguridad</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">Seguridad & Pagos</h4>
            <p className="text-xs text-gray-500 mb-2">
              Transacciones seguras mediante Wompi (Bancolombia, Nequi, PSE) y geolocalización protegida con Google Maps Platform.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Backend Verificado 100%
            </div>
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
