import { apiClient } from '../api/apiClient';
import { Departamento, Municipio } from '../types';

export const geografiaService = {
  async getDepartamentos(): Promise<Departamento[]> {
    const response = await apiClient.get<Departamento[]>('/api/geografia/departamentos');
    return response.data;
  },

  async getMunicipiosPorDepartamento(departamentoId: number | string): Promise<Municipio[]> {
    const response = await apiClient.get<Municipio[]>(`/api/geografia/departamentos/${departamentoId}/municipios`);
    return response.data;
  },

  async getTodosMunicipios(): Promise<Municipio[]> {
    const response = await apiClient.get<Municipio[]>('/api/geografia/municipios');
    return response.data;
  },

  async getMunicipio(municipioId: number | string): Promise<Municipio> {
    const response = await apiClient.get<Municipio>(`/api/geografia/municipios/${municipioId}`);
    return response.data;
  },
};
