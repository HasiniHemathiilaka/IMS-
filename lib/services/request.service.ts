import api from '@/lib/api';
import { InventoryRequest, StandardResponse, RequestStatus, DecisionDTO } from '@/lib/types';

export const requestApi = {
  // Common
  getAll: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/all');
    return response.data.data;
  },

  getByStatus: async (status: RequestStatus): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>(`/request/status/${status}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<InventoryRequest> => {
    const response = await api.get<StandardResponse<InventoryRequest>>(`/request/${id}`);
    return response.data.data;
  },

  getByDepartment: async (deptId: number): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>(`/request/department/${deptId}`);
    return response.data.data;
  },

  getByRequester: async (userId: number): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>(`/request/requester/${userId}`);
    return response.data.data;
  },

  getMyRequests: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/my');
    return response.data.data;
  },

  // Role-specific Pending Queues
  getPendingInCharge: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/pending/in-charge');
    return response.data.data;
  },

  getPendingMA: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/pending/ma');
    return response.data.data;
  },

  getPendingHOD: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/pending/hod');
    return response.data.data;
  },

  getPendingAdmin: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/pending/admin');
    return response.data.data;
  },

  getPendingWelfare: async (): Promise<InventoryRequest[]> => {
    const response = await api.get<StandardResponse<InventoryRequest[]>>('/request/pending/welfare');
    return response.data.data;
  },

  // Actions
  submit: async (data: any): Promise<InventoryRequest> => {
    const response = await api.post<StandardResponse<InventoryRequest>>('/request/submit', data);
    return response.data.data;
  },

  inChargeDecision: async (id: number, data: DecisionDTO): Promise<InventoryRequest> => {
    const response = await api.put<StandardResponse<InventoryRequest>>(`/request/in-charge-decision/${id}`, data);
    return response.data.data;
  },

  maDecision: async (id: number, data: DecisionDTO): Promise<InventoryRequest> => {
    const response = await api.put<StandardResponse<InventoryRequest>>(`/request/ma-decision/${id}`, data);
    return response.data.data;
  },

  hodDecision: async (id: number, data: DecisionDTO): Promise<InventoryRequest> => {
    const response = await api.put<StandardResponse<InventoryRequest>>(`/request/hod-decision/${id}`, data);
    return response.data.data;
  },

  adminDecision: async (id: number, data: DecisionDTO): Promise<InventoryRequest> => {
    const response = await api.put<StandardResponse<InventoryRequest>>(`/request/admin-decision/${id}`, data);
    return response.data.data;
  },

  welfareDecision: async (id: number, data: DecisionDTO): Promise<InventoryRequest> => {
    const response = await api.put<StandardResponse<InventoryRequest>>(`/request/welfare-decision/${id}`, data);
    return response.data.data;
  }
};
