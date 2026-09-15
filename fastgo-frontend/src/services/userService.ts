import { apiClient } from '../api/apiClient';
import { AuthUser } from '../types';

export const userService = {
  async listUsers(): Promise<AuthUser[]> {
    const response = await apiClient.get<AuthUser[]>('/api/usuarios');
    return response.data;
  },
};
