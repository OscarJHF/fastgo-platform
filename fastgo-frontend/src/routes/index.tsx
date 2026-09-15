import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { RoleRoute } from '../components/guards/RoleRoute';

// Pages
import { HomePage } from '../pages/client/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CommerceDetailPage } from '../pages/client/CommerceDetailPage';
import { CartPage } from '../pages/client/CartPage';
import { CheckoutPage } from '../pages/client/CheckoutPage';
import { AddressesPage } from '../pages/client/AddressesPage';
import { OrdersPage } from '../pages/client/OrdersPage';
import { OrderDetailPage } from '../pages/client/OrderDetailPage';
import { ProfilePage } from '../pages/client/ProfilePage';

// Commerce Pages
import { CommerceDashboardPage } from '../pages/commerce/CommerceDashboardPage';
import { CommerceOrdersPage } from '../pages/commerce/CommerceOrdersPage';
import { CommerceProductsPage } from '../pages/commerce/CommerceProductsPage';
import { CommerceBranchesPage } from '../pages/commerce/CommerceBranchesPage';

// Delivery Pages
import { DeliveryDashboardPage } from '../pages/delivery/DeliveryDashboardPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminCommercesPage } from '../pages/admin/AdminCommercesPage';

import { NotFoundPage } from '../pages/NotFoundPage';
import { APP_ROUTES } from '../constants/routes';

export const AppRoutes: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        {/* Rutas Públicas */}
        <Route path={APP_ROUTES.HOME} element={<HomePage />} />
        <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={APP_ROUTES.COMMERCE_DETAIL} element={<CommerceDetailPage />} />
        <Route path={APP_ROUTES.CART} element={<CartPage />} />

        {/* Rutas Protegidas - Cliente */}
        <Route
          path={APP_ROUTES.CHECKOUT}
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADDRESSES}
          element={
            <ProtectedRoute>
              <AddressesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.MY_ORDERS}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ORDER_DETAIL}
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Rutas Protegidas - Comercio */}
        <Route
          path={APP_ROUTES.COMMERCE_DASHBOARD}
          element={
            <RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}>
              <CommerceDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={APP_ROUTES.COMMERCE_ORDERS}
          element={
            <RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}>
              <CommerceOrdersPage />
            </RoleRoute>
          }
        />
        <Route
          path={APP_ROUTES.COMMERCE_PRODUCTS}
          element={
            <RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}>
              <CommerceProductsPage />
            </RoleRoute>
          }
        />
        <Route
          path={APP_ROUTES.COMMERCE_BRANCHES}
          element={
            <RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}>
              <CommerceBranchesPage />
            </RoleRoute>
          }
        />

        {/* Rutas Protegidas - Domiciliario */}
        <Route
          path={APP_ROUTES.DELIVERY_DASHBOARD}
          element={
            <RoleRoute allowedRoles={['DOMICILIARIO', 'ADMIN']}>
              <DeliveryDashboardPage />
            </RoleRoute>
          }
        />

        {/* Rutas Protegidas - Admin */}
        <Route
          path={APP_ROUTES.ADMIN_DASHBOARD}
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_USERS}
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </RoleRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_CATEGORIES}
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminCategoriesPage />
            </RoleRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_COMMERCES}
          element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminCommercesPage />
            </RoleRoute>
          }
        />

        {/* Rutas Aliases para compatibilidad REST y navegación directa */}
        <Route path="/comercio/dashboard" element={<RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}><CommerceDashboardPage /></RoleRoute>} />
        <Route path="/comercio/pedidos" element={<RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}><CommerceOrdersPage /></RoleRoute>} />
        <Route path="/comercio/productos" element={<RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}><CommerceProductsPage /></RoleRoute>} />
        <Route path="/comercio/sucursales" element={<RoleRoute allowedRoles={['COMERCIO', 'ADMIN']}><CommerceBranchesPage /></RoleRoute>} />

        <Route path="/domiciliario/dashboard" element={<RoleRoute allowedRoles={['DOMICILIARIO', 'ADMIN']}><DeliveryDashboardPage /></RoleRoute>} />

        <Route path="/admin" element={<RoleRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></RoleRoute>} />
        <Route path="/admin/usuarios" element={<RoleRoute allowedRoles={['ADMIN']}><AdminUsersPage /></RoleRoute>} />
        <Route path="/admin/categorias" element={<RoleRoute allowedRoles={['ADMIN']}><AdminCategoriesPage /></RoleRoute>} />
        <Route path="/admin/comercios" element={<RoleRoute allowedRoles={['ADMIN']}><AdminCommercesPage /></RoleRoute>} />

        <Route path="/pedidos" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
};
