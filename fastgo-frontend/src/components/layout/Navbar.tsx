import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock,
  Store,
  Bike,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FastGoLogo } from '../common/FastGoLogo';
import { APP_ROUTES } from '../../constants/routes';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to={APP_ROUTES.HOME} className="flex items-center gap-2 group">
              <FastGoLogo size="md" />
            </Link>

            {/* Role Badge if Authenticated */}
            {isAuthenticated && role && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                role === 'ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                role === 'COMERCIO' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                role === 'DOMICILIARIO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {role}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to={APP_ROUTES.HOME} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
              Explorar
            </Link>

            <Link to={APP_ROUTES.ENCOMIENDAS} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              Encomiendas
            </Link>

            {role === 'CLIENTE' && (
              <>
                <Link to={APP_ROUTES.MY_ORDERS} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Mis Pedidos
                </Link>
                <Link to={APP_ROUTES.ADDRESSES} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Direcciones
                </Link>
              </>
            )}

            {role === 'COMERCIO' && (
              <Link to={APP_ROUTES.COMMERCE_DASHBOARD} className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                Panel Comercio
              </Link>
            )}

            {role === 'DOMICILIARIO' && (
              <Link to={APP_ROUTES.DELIVERY_DASHBOARD} className="text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1.5">
                <Bike className="w-4 h-4" />
                Panel Domiciliario
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link to={APP_ROUTES.ADMIN_DASHBOARD} className="text-sm font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Panel Admin
              </Link>
            )}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button (For Client or Visitor) */}
            {(!role || role === 'CLIENTE') && (
              <Link
                to={APP_ROUTES.CART}
                className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 transition-all active:scale-95"
                aria-label="Ver Carrito de Compras"
              >
                <ShoppingBag className="w-5 h-5 text-gray-800" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={APP_ROUTES.PROFILE}
                  className="hidden sm:flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {user?.nombre?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-bold text-gray-900 leading-tight">{user?.nombre}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">{user?.correo}</p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to={APP_ROUTES.LOGIN}
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-emerald-700 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  to={APP_ROUTES.REGISTER}
                  className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-2 animate-slide-down">
          <Link
            to={APP_ROUTES.HOME}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50"
          >
            Explorar Comercios
          </Link>

          <Link
            to={APP_ROUTES.ENCOMIENDAS}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50 flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            Encomiendas y Envíos
          </Link>

          {role === 'CLIENTE' && (
            <>
              <Link
                to={APP_ROUTES.MY_ORDERS}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50"
              >
                Mis Pedidos
              </Link>
              <Link
                to={APP_ROUTES.ADDRESSES}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-800 hover:bg-gray-50"
              >
                Mis Direcciones
              </Link>
            </>
          )}

          {role === 'COMERCIO' && (
            <Link
              to={APP_ROUTES.COMMERCE_DASHBOARD}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-purple-700 hover:bg-purple-50"
            >
              Panel Comercio
            </Link>
          )}

          {role === 'DOMICILIARIO' && (
            <Link
              to={APP_ROUTES.DELIVERY_DASHBOARD}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-700 hover:bg-amber-50"
            >
              Panel Domiciliario
            </Link>
          )}

          {role === 'ADMIN' && (
            <Link
              to={APP_ROUTES.ADMIN_DASHBOARD}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-rose-700 hover:bg-rose-50"
            >
              Panel Administrador
            </Link>
          )}

          {isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <Link
                to={APP_ROUTES.PROFILE}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-900 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-gray-500" />
                Mi Perfil ({user?.nombre})
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link
                to={APP_ROUTES.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-50"
              >
                Ingresar
              </Link>
              <Link
                to={APP_ROUTES.REGISTER}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
