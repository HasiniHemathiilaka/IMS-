import api from '@/lib/api';
import { Department, StandardResponse } from '@/lib/types';

export const departmentApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await api.get<StandardResponse<Department[]>>('/department/all');
    return response.data.data;
  },
  
  create: async (department: Partial<Department>): Promise<Department> => {
    const response = await api.post<StandardResponse<Department>>('/department/save', department);
    return response.data.data;
  },

  update: async (id: number, department: Partial<Department>): Promise<Department> => {
    const response = await api.put<StandardResponse<Department>>(`/department/update/${id}`, department);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/department/delete/${id}`);
  }
};
