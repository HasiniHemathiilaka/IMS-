import api from '@/lib/api';
import { InventoryCategory, StandardResponse } from '@/lib/types';

export const categoryApi = {
  getAll: async (): Promise<InventoryCategory[]> => {
    const response = await api.get<StandardResponse<InventoryCategory[]>>('/category/all');
    return response.data.data;
  },

  save: async (category: Omit<InventoryCategory, 'id'>): Promise<InventoryCategory> => {
    const response = await api.post<StandardResponse<InventoryCategory>>('/category/save', category);
    return response.data.data;
  },

  update: async (id: number, category: Partial<InventoryCategory>): Promise<InventoryCategory> => {
    const response = await api.put<StandardResponse<InventoryCategory>>(`/category/update/${id}`, category);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/category/delete/${id}`);
  },
};
