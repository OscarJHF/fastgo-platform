import { apiClient } from '../api/apiClient';
import { AgregarCarritoRequest, Carrito, CarritoDetalle } from '../types';

export const cartService = {
  async getCart(sucursalId: number): Promise<Carrito> {
    const response = await apiClient.get<Carrito>('/api/carritos', {
      params: { sucursalId },
    });
    return response.data;
  },

  async getCartById(id: number): Promise<Carrito> {
    const response = await apiClient.get<Carrito>(`/api/carritos/${id}`);
    return response.data;
  },

  async getCartProducts(cartId: number): Promise<CarritoDetalle[]> {
    const response = await apiClient.get<CarritoDetalle[]>(`/api/carritos/${cartId}/productos`);
    return response.data;
  },

  async addProduct(data: AgregarCarritoRequest): Promise<CarritoDetalle> {
    const response = await apiClient.post<CarritoDetalle>('/api/carritos/productos', data);
    return response.data;
  },

  async updateQuantity(itemId: number, cantidad: number): Promise<CarritoDetalle> {
    const response = await apiClient.put<CarritoDetalle>(`/api/carritos/productos/${itemId}`, null, {
      params: { cantidad },
    });
    return response.data;
  },

  async removeItem(itemId: number): Promise<void> {
    await apiClient.delete(`/api/carritos/productos/${itemId}`);
  },

  async emptyCart(cartId: number): Promise<void> {
    await apiClient.delete(`/api/carritos/${cartId}/productos`);
  },
};
