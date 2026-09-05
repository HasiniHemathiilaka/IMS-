import api from '@/lib/api';
import { InventoryItem, StandardResponse } from '@/lib/types';

export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await api.get<StandardResponse<InventoryItem[]>>('/inventory/all');
    return response.data.data;
  },

  getByDepartment: async (deptId: number): Promise<InventoryItem[]> => {
    const response = await api.get<StandardResponse<InventoryItem[]>>(`/inventory/department/${deptId}`);
    return response.data.data;
  },

  getMyDepartment: async (): Promise<InventoryItem[]> => {
    const response = await api.get<StandardResponse<InventoryItem[]>>(`/inventory/my-department`);
    return response.data.data;
  },

  add: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.post<StandardResponse<InventoryItem>>('/inventory/add', item);
    return response.data.data;
  },

  update: async (id: number, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put<StandardResponse<InventoryItem>>(`/inventory/update/${id}`, item);
    return response.data.data;
  },

  stockIn: async (id: number, quantity: number): Promise<InventoryItem> => {
    const response = await api.put<StandardResponse<InventoryItem>>(`/inventory/stock-in/${id}`, { quantity });
    return response.data.data;
  },

  markDisused: async (id: number): Promise<void> => {
    await api.put(`/inventory/disuse/${id}`);
  }
};
