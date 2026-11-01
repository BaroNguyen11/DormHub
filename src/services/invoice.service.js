import { api, queryString } from '../api/apiClient';

export const invoiceService = {
  // Get all invoices with filters
  getAll: (params = {}) => api(`/invoices${queryString(params)}`),
  
  // Get invoice by ID
  getById: (id) => api(`/invoices/${id}`),
  
  // Create invoice
  create: (data) => api('/invoices', {
    method: 'POST',
    body: data,
  }),
};
