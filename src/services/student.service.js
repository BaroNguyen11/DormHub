import { api, queryString } from '../api/apiClient';

export const studentService = {
  // Student endpoints
  getMyProfile: () => api('/student/profile'),
  
  updateMyProfile: (data) => api('/student/profile', {
    method: 'PATCH',
    body: data,
  }),
  
  // Manager endpoints
  getAll: (params = {}) => api(`/manager/students${queryString(params)}`),
  
  getById: (id) => api(`/manager/students/${id}`),
  
  updateStatus: (id, status) => api(`/manager/students/${id}/status`, {
    method: 'PATCH',
    body: { status },
  }),
};
