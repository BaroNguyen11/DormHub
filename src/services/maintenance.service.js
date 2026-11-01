import { api, queryString } from '../api/apiClient';

export const maintenanceService = {
  // Student endpoints
  student: {
    create: (data) => api('/student/maintenance', {
      method: 'POST',
      body: data,
    }),
    
    getMyRequests: (params = {}) => api(`/student/maintenance${queryString(params)}`),
    
    getById: (id) => api(`/student/maintenance/${id}`),
  },
  
  // Manager endpoints
  manager: {
    getAll: (params = {}) => api(`/manager/maintenance${queryString(params)}`),
    
    getById: (id) => api(`/manager/maintenance/${id}`),
    
    updateStatus: (id, data) => api(`/manager/maintenance/${id}/status`, {
      method: 'PATCH',
      body: data,
    }),
  },
};
