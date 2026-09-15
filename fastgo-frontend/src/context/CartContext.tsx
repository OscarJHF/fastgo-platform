import React, { createContext, useContext, useState } from 'react';
import { cartService } from '../services/cartService';
import { productoService } from '../services/productoService';
import { Carrito, CartItemWithProduct, Producto } from '../types';

interface CartContextType {
  cart: Carrito | null;
  items: CartItemWithProduct[];
  activeBranchId: number | null;
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  loadCartForBranch: (sucursalId: number) => Promise<void>;
  addItem: (sucursalId: number, producto: Producto, cantidad: number) => Promise<void>;
  updateQuantity: (itemId: number, cantidad: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Carrito | null>(null);
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<number | null>(() => {
    const saved = localStorage.getItem('fastgo_active_branch_id');
    return saved ? Number(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Re-hidratar el carrito al iniciar si hay una sucursal activa en almacenamiento local
  React.useEffect(() => {
    const saved = localStorage.getItem('fastgo_active_branch_id');
    const token = localStorage.getItem('fastgo_token');
    if (saved && token) {
      loadCartForBranch(Number(saved));
    }
  }, []);

  const loadCartForBranch = async (sucursalId: number) => {
    setIsLoading(true);
    try {
      const activeCart = await cartService.getCart(sucursalId);
      setCart(activeCart);
      setActiveBranchId(sucursalId);
      localStorage.setItem('fastgo_active_branch_id', String(sucursalId));

      const cartItems = await cartService.getCartProducts(activeCart.id);
      
      // Enriquecer items con info de producto si está disponible
      const enrichedItems: CartItemWithProduct[] = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const prod = await productoService.getProduct(item.productoId);
            return { ...item, producto: prod };
          } catch {
            return item;
          }
        })
      );

      setItems(enrichedItems);
    } catch {
      setCart(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (sucursalId: number, producto: Producto, cantidad: number) => {
    setIsLoading(true);
    try {
      let currentCart = cart;
      if (!currentCart || activeBranchId !== sucursalId) {
        currentCart = await cartService.getCart(sucursalId);
        setCart(currentCart);
        setActiveBranchId(sucursalId);
      }

      await cartService.addProduct({
        carritoId: currentCart.id,
        productoId: producto.id,
        cantidad,
      });

      // Recargar productos del carrito
      const updatedDetails = await cartService.getCartProducts(currentCart.id);
      const enriched: CartItemWithProduct[] = await Promise.all(
        updatedDetails.map(async (item) => {
          if (item.productoId === producto.id) {
            return { ...item, producto };
          }
          try {
            const p = await productoService.getProduct(item.productoId);
            return { ...item, producto: p };
          } catch {
            return item;
          }
        })
      );
      setItems(enriched);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, cantidad: number) => {
    if (cantidad <= 0) {
      await removeItem(itemId);
      return;
    }
    setIsLoading(true);
    try {
      await cartService.updateQuantity(itemId, cantidad);
      if (cart) {
        const updated = await cartService.getCartProducts(cart.id);
        setItems((prev) =>
          updated.map((item) => {
            const existing = prev.find((p) => p.id === item.id);
            return { ...item, producto: existing?.producto };
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      await cartService.removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart) return;
    setIsLoading(true);
    try {
      await cartService.emptyCart(cart.id);
      setItems([]);
      setCart(null);
      setActiveBranchId(null);
      localStorage.removeItem('fastgo_active_branch_id');
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        activeBranchId,
        isLoading,
        itemCount,
        subtotal,
        loadCartForBranch,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
