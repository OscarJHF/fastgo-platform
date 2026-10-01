import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { commerceService } from '../services/commerceService';
import { Comercio, ConfiguracionSuscripcion } from '../types';
import { useAuth } from './AuthContext';

interface MerchantStoreContextType {
  stores: Comercio[];
  selectedStore: Comercio | null;
  subscriptionConfig: ConfiguracionSuscripcion | null;
  isLoading: boolean;
  setSelectedStore: (store: Comercio) => void;
  selectStoreById: (id: number) => void;
  refreshStores: () => Promise<Comercio[]>;
}

const STORAGE_KEY = 'fastgo_selected_store_id';

const MerchantStoreContext = createContext<MerchantStoreContextType | undefined>(undefined);

export const MerchantStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, activeRole } = useAuth();
  const [stores, setStores] = useState<Comercio[]>([]);
  const [selectedStore, setSelectedStoreState] = useState<Comercio | null>(null);
  const [subscriptionConfig, setSubscriptionConfig] = useState<ConfiguracionSuscripcion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isMerchant = isAuthenticated && (activeRole === 'COMERCIO' || user?.rol === 'COMERCIO');

  const refreshStores = useCallback(async (): Promise<Comercio[]> => {
    if (!isMerchant) {
      setStores([]);
      setSelectedStoreState(null);
      return [];
    }

    setIsLoading(true);
    try {
      const [tiendas, config] = await Promise.all([
        commerceService.listMisTiendas().catch(() => []),
        commerceService.getSubscriptionConfig().catch(() => null),
      ]);

      setStores(tiendas);
      if (config) {
        setSubscriptionConfig(config);
      }

      if (tiendas.length > 0) {
        const savedIdStr = localStorage.getItem(STORAGE_KEY);
        const savedId = savedIdStr ? parseInt(savedIdStr, 10) : null;
        const matched = savedId ? tiendas.find((t) => t.id === savedId) : null;
        const toSelect = matched || tiendas.find((t) => t.esPrincipal) || tiendas[0];

        setSelectedStoreState(toSelect);
        localStorage.setItem(STORAGE_KEY, toSelect.id.toString());
      } else {
        setSelectedStoreState(null);
        localStorage.removeItem(STORAGE_KEY);
      }

      return tiendas;
    } catch (err) {
      console.error('Error al cargar tiendas del comerciante:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isMerchant]);

  useEffect(() => {
    if (isMerchant) {
      refreshStores();
    } else {
      setStores([]);
      setSelectedStoreState(null);
    }
  }, [isMerchant, refreshStores]);

  const setSelectedStore = (store: Comercio) => {
    setSelectedStoreState(store);
    localStorage.setItem(STORAGE_KEY, store.id.toString());
  };

  const selectStoreById = (id: number) => {
    const store = stores.find((s) => s.id === id);
    if (store) {
      setSelectedStore(store);
    }
  };

  return (
    <MerchantStoreContext.Provider
      value={{
        stores,
        selectedStore,
        subscriptionConfig,
        isLoading,
        setSelectedStore,
        selectStoreById,
        refreshStores,
      }}
    >
      {children}
    </MerchantStoreContext.Provider>
  );
};

export const useMerchantStore = (): MerchantStoreContextType => {
  const context = useContext(MerchantStoreContext);
  if (!context) {
    throw new Error('useMerchantStore debe utilizarse dentro de un MerchantStoreProvider');
  }
  return context;
};
