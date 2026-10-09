import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { MerchantStoreProvider } from './context/MerchantStoreContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MerchantStoreProvider>
            <CartProvider>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </CartProvider>
          </MerchantStoreProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
