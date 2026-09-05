import api from '@/lib/api';
import { User, StandardResponse } from '@/lib/types';
import { normalizeRole } from '@/lib/roleUtils';

const normalizeUsers = (users: User[]): User[] =>
  users.map(u => ({ ...u, role: normalizeRole(u.role) }));

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<StandardResponse<User[]>>('/user/all');
    return normalizeUsers(response.data.data);
  },

  register: async (userData: any): Promise<void> => {
    await api.post('/auth/signup', userData);
  },

  getPending: async (): Promise<User[]> => {
    const response = await api.get<StandardResponse<User[]>>('/user/pending');
    return normalizeUsers(response.data.data);
  },

  approve: async (id: number): Promise<void> => {
    await api.put<StandardResponse<void>>(`/user/approve/${id}`);
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await api.put<StandardResponse<User>>(`/user/update/${id}`, user);
    return response.data.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await api.put(`/user/deactivate/${id}`);
  }
};
