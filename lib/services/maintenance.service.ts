import api from '@/lib/api';
import { MaintenanceRecord, StandardResponse } from '@/lib/types';

export const maintenanceApi = {
  // Get all maintenance records
  getAll: async (): Promise<MaintenanceRecord[]> => {
    const response = await api.get<StandardResponse<MaintenanceRecord[]>>('/maintenance/all');
    return response.data.data;
  },

  // Get maintenance history for a specific item
  getHistory: async (itemId: string): Promise<MaintenanceRecord[]> => {
    const response = await api.get<StandardResponse<MaintenanceRecord[]>>(`/maintenance/history/${itemId}`);
    return response.data.data;
  },

  // Log a new maintenance issue
  request: async (data: { inventoryItemId: number; description: string; type?: string }): Promise<MaintenanceRecord> => {
    const response = await api.post<StandardResponse<MaintenanceRecord>>('/maintenance/request', data);
    return response.data.data;
  },

  // Approve maintenance (IMO usually)
  approve: async (id: number, serviceProvider?: string, estimatedCost?: number): Promise<MaintenanceRecord> => {
    const params = new URLSearchParams();
    if (serviceProvider) params.append('serviceProvider', serviceProvider);
    if (estimatedCost) params.append('estimatedCost', estimatedCost.toString());
    
    const response = await api.put<StandardResponse<MaintenanceRecord>>(`/maintenance/approve/${id}?${params.toString()}`);
    return response.data.data;
  },

  // Mark as completed
  complete: async (id: number): Promise<MaintenanceRecord> => {
    const response = await api.put<StandardResponse<MaintenanceRecord>>(`/maintenance/complete/${id}`);
    return response.data.data;
  }
};
