import { apiClient } from '../api/apiClient';
import { Producto, ProductoRequest } from '../types';

export const productoService = {
  async listProducts(): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>('/api/productos');
    return response.data;
  },

  async getProduct(id: number): Promise<Producto> {
    const response = await apiClient.get<Producto>(`/api/productos/${id}`);
    return response.data;
  },

  async listBySucursal(sucursalId: number): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>(`/api/productos/sucursal/${sucursalId}`);
    return response.data;
  },

  async listByCategoria(categoriaId: number): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>(`/api/productos/categoria/${categoriaId}`);
    return response.data;
  },

  async listDisponibles(): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>('/api/productos/disponibles');
    return response.data;
  },

  async listDestacados(): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>('/api/productos/destacados');
    return response.data;
  },

  async createProduct(data: ProductoRequest): Promise<Producto> {
    const response = await apiClient.post<Producto>('/api/productos', data);
    return response.data;
  },

  async updateProduct(id: number, data: ProductoRequest): Promise<Producto> {
    const response = await apiClient.put<Producto>(`/api/productos/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/api/productos/${id}`);
  },
};
