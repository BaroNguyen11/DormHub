import { api, queryString } from '../api/apiClient';

export const contractService = {
  // Get all contracts with filters
  getAll: (params = {}) => api(`/contracts${queryString(params)}`),
  
  // Get contract by ID
  getById: (id) => api(`/contracts/${id}`),
  
  // Create new contract
  create: (data) => api('/contracts', {
    method: 'POST',
    body: data,
  }),
  
  // Update pending contract
  update: (id, data) => api(`/contracts/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  // Cancel pending contract
  cancel: (id) => api(`/contracts/${id}/cancel`, {
    method: 'PATCH',
  }),
};
