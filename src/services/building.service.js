import { api, queryString } from '../api/apiClient';

export const buildingService = {
  // Get all buildings
  getAll: () => api('/manager/buildings'),
  
  // Get building by ID
  getById: (id) => api(`/manager/buildings/${id}`),
  
  // Create new building
  create: (data) => api('/manager/buildings', {
    method: 'POST',
    body: data,
  }),
  
  // Update building
  update: (id, data) => api(`/manager/buildings/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  // Delete building
  delete: (id) => api(`/manager/buildings/${id}`, {
    method: 'DELETE',
  }),
};
