import { apiClient } from '../api/apiClient';
import { CategoriaComercio, CategoriaProducto } from '../types';

export const categoriaService = {
  async listCommerceCategories(): Promise<CategoriaComercio[]> {
    const response = await apiClient.get<CategoriaComercio[]>('/api/categorias-comercio');
    return response.data;
  },

  async listActiveCommerceCategories(): Promise<CategoriaComercio[]> {
    const response = await apiClient.get<CategoriaComercio[]>('/api/categorias-comercio/activas');
    return response.data;
  },

  async listProductCategories(): Promise<CategoriaProducto[]> {
    const response = await apiClient.get<CategoriaProducto[]>('/api/categorias-producto');
    return response.data;
  },

  async listActiveProductCategories(): Promise<CategoriaProducto[]> {
    const response = await apiClient.get<CategoriaProducto[]>('/api/categorias-producto/activas');
    return response.data;
  },

  async createProductCategory(data: Partial<CategoriaProducto>): Promise<CategoriaProducto> {
    const response = await apiClient.post<CategoriaProducto>('/api/categorias-producto', data);
    return response.data;
  },

  async updateProductCategory(id: number, data: Partial<CategoriaProducto>): Promise<CategoriaProducto> {
    const response = await apiClient.put<CategoriaProducto>(`/api/categorias-producto/${id}`, data);
    return response.data;
  },

  async deleteProductCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/categorias-producto/${id}`);
  },
};
