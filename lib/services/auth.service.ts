import api from '@/lib/api';

export const authApi = {
  login: async (credentials: any) => {
    // Expected to return StandardResponse with JWT
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },
  
  // Gets all departments (doesn't need auth, widely useful for registration/lookups)
  getDepartments: async () => {
    const response = await api.get('/department/all');
    return response.data;
  }
};
